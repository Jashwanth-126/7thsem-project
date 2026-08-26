from flask import Blueprint, request, jsonify
from supabase import create_client
from dotenv import load_dotenv
import os
import datetime

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

traceability_bp = Blueprint("traceability", __name__)

def log_traceability_event(crop_id, traceability_id, performed_by, role, action, price=None, location=None, remarks=None, status="Updated"):
    """
    Safely inserts a log into traceability_history table if it exists.
    """
    try:
        if not traceability_id and crop_id:
            # fetch traceability_id from crop_qr or crops
            qr_res = supabase.table("crop_qr").select("qr_traceability_id").eq("crop_id", str(crop_id)).execute()
            if qr_res.data and len(qr_res.data) > 0:
                traceability_id = qr_res.data[0].get("qr_traceability_id")
            else:
                crop_res = supabase.table("crops").select("qr_traceability_id").eq("id", str(crop_id)).execute()
                if crop_res.data and len(crop_res.data) > 0:
                    traceability_id = crop_res.data[0].get("qr_traceability_id")
        
        if not traceability_id:
            traceability_id = f"KM-TRC-{str(crop_id)[:8].upper()}"

        record = {
            "crop_id": str(crop_id) if crop_id else None,
            "traceability_id": str(traceability_id),
            "performed_by": str(performed_by or "System"),
            "role": str(role or "System"),
            "action": str(action),
            "price": float(price) if price is not None else None,
            "location": str(location or ""),
            "remarks": str(remarks or ""),
            "status": str(status),
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }

        supabase.table("traceability_history").insert(record).execute()
        print(f"[Traceability Logged] {action} for ID: {traceability_id}")
    except Exception as e:
        print(f"[Traceability Log Warning] Could not record event to traceability_history: {e}")

@traceability_bp.route("/traceability/<traceability_id>", methods=["GET"])
@traceability_bp.route("/api/traceability/<traceability_id>", methods=["GET"])
def get_traceability_details(traceability_id):
    try:
        clean_tid = str(traceability_id).strip()
        crop_id = None
        qr_base64 = None
        
        # 0. Check retailer_inventory table by id, crop_id, or auction_id
        try:
            r_inv = supabase.table("retailer_inventory").select("*").eq("id", clean_tid).execute()
            if not r_inv.data and str(clean_tid).isdigit():
                r_inv = supabase.table("retailer_inventory").select("*").eq("id", int(clean_tid)).execute()
            if r_inv.data and len(r_inv.data) > 0:
                inv_item = r_inv.data[0]
                if inv_item.get("crop_id"):
                    crop_id = inv_item.get("crop_id")
                elif inv_item.get("auction_id"):
                    auc = supabase.table("crop_auctions").select("crop_id").eq("id", inv_item.get("auction_id")).execute()
                    if auc.data:
                        crop_id = auc.data[0].get("crop_id")
        except Exception:
            pass

        # 1. Fetch from crop_qr first
        if not crop_id:
            try:
                crop_qr_res = supabase.table("crop_qr").select("*").eq("qr_traceability_id", clean_tid).execute()
                if not crop_qr_res.data:
                    crop_qr_res = supabase.table("crop_qr").select("*").eq("crop_id", str(clean_tid)).execute()
                if crop_qr_res.data and len(crop_qr_res.data) > 0:
                    crop_qr_item = crop_qr_res.data[0]
                    crop_id = crop_qr_item.get("crop_id")
                    qr_base64 = crop_qr_item.get("qr_base64")
                    clean_tid = crop_qr_item.get("qr_traceability_id") or clean_tid
            except Exception:
                pass

        # 2. Match qr_traceability_id in crops table
        if not crop_id:
            try:
                crop_by_tid = supabase.table("crops").select("*").eq("qr_traceability_id", clean_tid).execute()
                if crop_by_tid.data and len(crop_by_tid.data) > 0:
                    crop_id = crop_by_tid.data[0]["id"]
            except Exception:
                pass

        # 3. Check by crop ID in crops table directly
        if not crop_id:
            try:
                crop_by_id = supabase.table("crops").select("*").eq("id", str(clean_tid)).execute()
                if not crop_by_id.data and str(clean_tid).isdigit():
                    crop_by_id = supabase.table("crops").select("*").eq("id", int(clean_tid)).execute()
                if crop_by_id.data and len(crop_by_id.data) > 0:
                    crop_id = crop_by_id.data[0]["id"]
            except Exception:
                pass

        # 4. Check crop_auctions
        if not crop_id:
            try:
                auc_res = supabase.table("crop_auctions").select("crop_id").eq("id", str(clean_tid)).execute()
                if not auc_res.data and str(clean_tid).isdigit():
                    auc_res = supabase.table("crop_auctions").select("crop_id").eq("id", int(clean_tid)).execute()
                if auc_res.data and len(auc_res.data) > 0:
                    crop_id = auc_res.data[0].get("crop_id")
            except Exception:
                pass

        # 5. Check traceability_history table directly
        if not crop_id:
            try:
                th_res = supabase.table("traceability_history").select("crop_id, traceability_id").eq("traceability_id", clean_tid).execute()
                if th_res.data and len(th_res.data) > 0 and th_res.data[0].get("crop_id"):
                    crop_id = th_res.data[0].get("crop_id")
            except Exception:
                pass

        if not crop_id:
            return jsonify({"success": False, "message": f"Traceability record not found for ID: {clean_tid}"}), 404

        # Fetch crop_qr for canonical qr_traceability_id if not loaded
        if crop_id and not qr_base64:
            try:
                cqr = supabase.table("crop_qr").select("*").eq("crop_id", str(crop_id)).execute()
                if cqr.data and len(cqr.data) > 0:
                    qr_base64 = cqr.data[0].get("qr_base64")
                    if cqr.data[0].get("qr_traceability_id"):
                        clean_tid = cqr.data[0].get("qr_traceability_id")
            except Exception:
                pass

        # 2. Fetch main crop row
        crop_data_res = supabase.table("crops").select("*").eq("id", str(crop_id)).execute()
        if not crop_data_res.data or len(crop_data_res.data) == 0:
            return jsonify({"success": False, "message": "Crop details not found"}), 404

        crop = crop_data_res.data[0]

        # 3. Fetch Image URL
        image_url = ""
        try:
            img_res = supabase.table("crop_images").select("image_url").eq("crop_id", str(crop_id)).execute()
            if img_res.data and len(img_res.data) > 0:
                image_url = img_res.data[0].get("image_url", "")
        except Exception:
            pass

        # 4. Fetch Farmer Details
        farmer_name = "Farmer"
        village = "N/A"
        district = crop.get("district") or "N/A"
        state = "Karnataka"
        farmer_mobile = ""

        if crop.get("farmer_id"):
            try:
                f_res = supabase.table("farmers").select("*").eq("id", crop.get("farmer_id")).execute()
                if f_res.data and len(f_res.data) > 0:
                    farmer = f_res.data[0]
                    farmer_name = farmer.get("name") or farmer.get("farmer_name") or farmer_name
                    village = farmer.get("village") or farmer.get("city_village") or village
                    district = farmer.get("district") or district
                    state = farmer.get("state") or state
                    farmer_mobile = farmer.get("phone") or farmer.get("mobile_number") or ""
            except Exception:
                pass

        # 5. Fetch Verification Info
        verification_status = crop.get("verification_status") or "pending"
        verified_by = crop.get("verified_by") or ""
        verified_district = crop.get("verified_district") or district
        verified_at = crop.get("verified_at")
        quality_grade = crop.get("quality_grade") or "Grade A"
        pfo_remarks = crop.get("pfo_remarks") or ""

        # 6. Fetch Auction & Bid Data
        auction_status = "No Auction"
        winning_bid = None
        highest_bid = None
        dealer_name = None
        dealer_id = None
        auction_id = None
        winner_name = None
        winner_role = None
        winning_timestamp = None

        # Try to fetch from completed_auction_results first
        try:
            comp_res = supabase.table("completed_auction_results").select("*").eq("crop_id", str(crop_id)).execute()
            if not comp_res.data and str(crop_id).isdigit():
                comp_res = supabase.table("completed_auction_results").select("*").eq("crop_id", int(crop_id)).execute()
            if comp_res.data and len(comp_res.data) > 0:
                comp_item = comp_res.data[0]
                winner_name = comp_item.get("winner_name")
                raw_wrole = comp_item.get("winner_role") or "Dealer"
                winner_role = str(raw_wrole).capitalize()
                winning_bid = float(comp_item.get("final_bid") or 0)
                winning_timestamp = comp_item.get("winning_timestamp") or comp_item.get("created_at")
                dealer_name = winner_name
        except Exception:
            pass

        try:
            auc_res = supabase.table("crop_auctions").select("*").eq("crop_id", str(crop_id)).execute()
            if auc_res.data and len(auc_res.data) > 0:
                auction = auc_res.data[0]
                auction_id = auction.get("id")
                auction_status = auction.get("auction_status") or "active"

                bids_res = supabase.table("crop_bids").select("*").eq("crop_id", str(crop_id)).order("bid_amount", desc=True).execute()
                if bids_res.data and len(bids_res.data) > 0:
                    highest_bid = float(bids_res.data[0].get("bid_amount", 0))
                    
                    # If winning bid id exists
                    win_bid_id = auction.get("winning_bid_id")
                    winning_bid_item = None
                    if win_bid_id:
                        for b in bids_res.data:
                            if str(b.get("id")) == str(win_bid_id):
                                winning_bid_item = b
                                break
                    if not winning_bid_item:
                        winning_bid_item = bids_res.data[0]

                    if winning_bid is None:
                        winning_bid = float(winning_bid_item.get("bid_amount", highest_bid))

                    if not winner_role:
                        raw_r = winning_bid_item.get("bidder_role") or "Dealer"
                        winner_role = str(raw_r).capitalize()

                    dealer_id = winning_bid_item.get("bidder_id")

                    if not winner_name and dealer_id:
                        if winner_role.lower() == "retailer":
                            try:
                                r_res = supabase.table("retailers").select("*").eq("id", dealer_id).execute()
                                if r_res.data and len(r_res.data) > 0:
                                    winner_name = r_res.data[0].get("name") or r_res.data[0].get("business_name") or f"Retailer #{dealer_id}"
                            except Exception:
                                pass
                        if not winner_name:
                            try:
                                d_res = supabase.table("dealers").select("*").eq("id", dealer_id).execute()
                                if d_res.data and len(d_res.data) > 0:
                                    winner_name = d_res.data[0].get("name") or d_res.data[0].get("business_name") or f"Dealer #{dealer_id}"
                            except Exception:
                                pass
                        if not winner_name:
                            winner_name = f"User #{dealer_id}"
                        dealer_name = winner_name
        except Exception:
            pass

        # 7. Fetch Payment / Delivery (Dealer Purchase)
        dealer_purchase_price = winning_bid
        delivery_completed = False
        if auction_id:
            try:
                del_res = supabase.table("crop_deliveries").select("*").eq("auction_id", auction_id).execute()
                if del_res.data and len(del_res.data) > 0:
                    delivery_completed = del_res.data[0].get("delivery_completed", False)
            except Exception:
                pass

        # 8. Fetch Retailer Inventory & Retail Purchase
        retailer_name = None
        retailer_purchase_price = None
        retail_selling_price = None
        retailer_inv_id = None

        try:
            r_inv_res = supabase.table("retailer_inventory").select("*").eq("crop_id", str(crop_id)).execute()
            if not r_inv_res.data or len(r_inv_res.data) == 0:
                if auction_id:
                    r_inv_res = supabase.table("retailer_inventory").select("*").eq("auction_id", auction_id).execute()
            
            if r_inv_res.data and len(r_inv_res.data) > 0:
                inv_item = r_inv_res.data[0]
                retailer_inv_id = inv_item.get("id")
                retailer_purchase_price = float(inv_item.get("purchase_price", 0))
                retail_selling_price = float(inv_item.get("selling_price", 0))
                r_id = inv_item.get("retailer_id")
                
                if r_id:
                    try:
                        r_res = supabase.table("retailers").select("*").eq("id", r_id).execute()
                        if r_res.data and len(r_res.data) > 0:
                            retailer_name = r_res.data[0].get("business_name") or r_res.data[0].get("name") or f"Retailer #{r_id}"
                        else:
                            retailer_name = f"Retailer #{r_id}"
                    except Exception:
                        retailer_name = f"Retailer #{r_id}"
        except Exception:
            pass

        # 9. Fetch Customer Order Details
        customer_name = None
        customer_purchase_price = None
        purchase_date = None

        if retailer_inv_id:
            try:
                item_res = supabase.table("order_items").select("*").eq("inventory_item_id", str(retailer_inv_id)).execute()
                if item_res.data and len(item_res.data) > 0:
                    order_item = item_res.data[0]
                    customer_purchase_price = float(order_item.get("price_per_unit") or order_item.get("total_price") or 0)
                    order_id = order_item.get("order_id")
                    
                    if order_id:
                        ord_res = supabase.table("customer_orders").select("*").eq("id", str(order_id)).execute()
                        if ord_res.data and len(ord_res.data) > 0:
                            c_ord = ord_res.data[0]
                            purchase_date = c_ord.get("created_at")
                            c_id = c_ord.get("customer_id")
                            if c_id:
                                c_res = supabase.table("customers").select("*").eq("id", c_id).execute()
                                if c_res.data and len(c_res.data) > 0:
                                    customer_name = c_res.data[0].get("name") or c_res.data[0].get("customer_name") or f"Customer #{c_id}"
                                else:
                                    customer_name = f"Customer #{c_id}"
            except Exception:
                pass

        # 10. Compute Current Owner and Current Status
        if customer_name:
            current_owner = customer_name
            current_status = "Purchased by Customer"
        elif retailer_name:
            current_owner = retailer_name
            current_status = "Purchased by Retailer"
        elif winner_name or dealer_name:
            current_owner = winner_name or dealer_name
            current_status = "Sold to Dealer" if delivery_completed else "Auction Completed"
        elif verification_status == "verified":
            current_owner = farmer_name
            current_status = "Auction Active" if auction_status == "active" else "Verified"
        else:
            current_owner = farmer_name
            current_status = "Listed"

        # AI yield & price prediction mock calculation based on real crop features
        base_price = float(crop.get("expected_price") or 30)
        yield_score = 92 if verification_status == "verified" else 84
        ai_yield_prediction = f"High Quality ({yield_score}% Optimal Harvest Yield)"
        predicted_market_price = f"₹{round(base_price * 1.05, 2)} - ₹{round(base_price * 1.30, 2)} / {crop.get('unit') or 'kg'}"

        # 11. Price Evolution List
        price_history = []

        price_history.append({
            "stage": "Farmer Base Price",
            "price": base_price,
            "label": f"₹{base_price}/{crop.get('unit') or 'kg'}",
            "actor": farmer_name,
            "role": "Farmer"
        })

        if highest_bid or winning_bid:
            p_bid = winning_bid or highest_bid
            price_history.append({
                "stage": "Highest Auction Bid",
                "price": p_bid,
                "label": f"₹{p_bid}/{crop.get('unit') or 'kg'}",
                "actor": winner_name or dealer_name or "Top Bidder",
                "role": winner_role or "Dealer"
            })

        if dealer_purchase_price:
            price_history.append({
                "stage": "Dealer Purchase Price",
                "price": dealer_purchase_price,
                "label": f"₹{dealer_purchase_price}/{crop.get('unit') or 'kg'}",
                "actor": winner_name or dealer_name or "Dealer",
                "role": winner_role or "Dealer"
            })

        if retailer_purchase_price:
            price_history.append({
                "stage": "Retailer Purchase Price",
                "price": retailer_purchase_price,
                "label": f"₹{retailer_purchase_price}/{crop.get('unit') or 'kg'}",
                "actor": retailer_name or "Retailer",
                "role": "Retailer"
            })

        if retail_selling_price or customer_purchase_price:
            final_p = customer_purchase_price or retail_selling_price
            price_history.append({
                "stage": "Final Customer Price",
                "price": final_p,
                "label": f"₹{final_p}/{crop.get('unit') or 'kg'}",
                "actor": customer_name or "Customer",
                "role": "Customer"
            })

        return jsonify({
            "success": True,
            "traceability_id": clean_tid,
            "qr_base64": qr_base64,
            "crop_id": str(crop_id),
            "crop_image": image_url,
            "crop_name": crop.get("crop_name"),
            "category": crop.get("crop_category") or crop.get("crop_variety") or "Agriculture",
            "quantity": crop.get("quantity"),
            "unit": crop.get("unit") or "kg",
            "expected_price": base_price,
            "farmer_name": farmer_name,
            "village": village,
            "district": district,
            "state": state,
            "farmer_mobile": farmer_mobile,
            "harvest_date": crop.get("harvest_date") or "N/A",
            "listing_date": crop.get("created_at") or "N/A",
            "verification_status": verification_status,
            "quality_grade": quality_grade,
            "verified_by": verified_by,
            "verified_district": verified_district,
            "verified_at": verified_at,
            "pfo_remarks": pfo_remarks,
            "auction_status": auction_status,
            "winning_bid": winning_bid,
            "highest_bid": highest_bid,
            "winner_name": winner_name,
            "winner_role": winner_role,
            "winning_timestamp": winning_timestamp,
            "dealer_name": dealer_name,
            "dealer_purchase_price": dealer_purchase_price,
            "retailer_name": retailer_name,
            "retailer_purchase_price": retailer_purchase_price,
            "retail_selling_price": retail_selling_price,
            "customer_name": customer_name,
            "customer_purchase_price": customer_purchase_price,
            "purchase_date": purchase_date,
            "current_owner": current_owner,
            "current_status": current_status,
            "ai_yield_prediction": ai_yield_prediction,
            "predicted_market_price": predicted_market_price,
            "price_history": price_history
        })

    except Exception as e:
        print(f"[Traceability Endpoint Error] {e}")
        return jsonify({"success": False, "message": str(e)}), 500


@traceability_bp.route("/traceability/history/<traceability_id>", methods=["GET"])
@traceability_bp.route("/api/traceability/history/<traceability_id>", methods=["GET"])
def get_traceability_history(traceability_id):
    try:
        clean_tid = str(traceability_id).strip()
        history_records = []

        # First fetch details to get crop_id and canonical traceability_id
        details_res = get_traceability_details(clean_tid)
        status_code = 200
        response_obj = details_res
        
        if isinstance(details_res, tuple):
            response_obj = details_res[0]
            status_code = details_res[1]
        elif hasattr(details_res, "status_code"):
            status_code = details_res.status_code

        crop_id_val = None
        canonical_tid = clean_tid
        details_data = None

        if status_code == 200 and hasattr(response_obj, "get_json"):
            details_data = response_obj.get_json()
            crop_id_val = details_data.get("crop_id")
            canonical_tid = details_data.get("traceability_id") or clean_tid

        # 1. Fetch explicitly logged events from traceability_history table by traceability_id or crop_id
        try:
            hist_res = supabase.table("traceability_history").select("*").eq("traceability_id", canonical_tid).order("created_at", desc=False).execute()
            if not hist_res.data and clean_tid != canonical_tid:
                hist_res = supabase.table("traceability_history").select("*").eq("traceability_id", clean_tid).order("created_at", desc=False).execute()
            if not hist_res.data and crop_id_val:
                hist_res = supabase.table("traceability_history").select("*").eq("crop_id", str(crop_id_val)).order("created_at", desc=False).execute()
            if hist_res.data:
                history_records = hist_res.data
        except Exception as err:
            print(f"[History Query Note] {err}")

        # Remove any unwanted intermediate events as per requirement
        forbidden_actions = {
            "highest bid updated",
            "winning bid confirmed",
            "winner details updated",
            "winning bid selected"
        }
        if history_records:
            history_records = [
                r for r in history_records
                if str(r.get("action", "")).strip().lower() not in forbidden_actions
            ]

        # 2. If explicit history is empty, dynamically synthesize full historical timeline from crop details
        if not history_records and details_data:
            data = details_data
            c_id = crop_id_val

            # Step 1: Crop Added
            history_records.append({
                "id": "step-1",
                "crop_id": c_id,
                "traceability_id": clean_tid,
                "performed_by": data.get("farmer_name"),
                "role": "Farmer",
                "action": "Crop Added",
                "price": data.get("expected_price"),
                "location": f"{data.get('village')}, {data.get('district')}, {data.get('state')}",
                "remarks": f"Crop listed by farmer with harvest date {data.get('harvest_date')}",
                "status": "Listed",
                "created_at": data.get("listing_date")
            })

            # Step 2: Crop Verified
            if data.get("verification_status") == "verified":
                history_records.append({
                    "id": "step-2",
                    "crop_id": c_id,
                    "traceability_id": clean_tid,
                    "performed_by": data.get("verified_by") or "Karnataka PFO Officer",
                    "role": "PFO",
                    "action": "Crop Verified",
                    "price": data.get("expected_price"),
                    "location": f"{data.get('verified_district') or data.get('district')}, {data.get('state')}",
                    "remarks": f"Quality Grade: {data.get('quality_grade')}. Remarks: {data.get('pfo_remarks') or 'Verified successfully'}",
                    "status": "Verified",
                    "created_at": data.get("verified_at") or data.get("listing_date")
                })

                # Step 3: Auction Started
                history_records.append({
                    "id": "step-3",
                    "crop_id": c_id,
                    "traceability_id": clean_tid,
                    "performed_by": "System Automated Auction Engine",
                    "role": "System",
                    "action": "Auction Started",
                    "price": data.get("expected_price"),
                    "location": f"{data.get('district')}, {data.get('state')}",
                    "remarks": f"Live bidding started with base price ₹{data.get('expected_price')}",
                    "status": "Auction Active",
                    "created_at": data.get("verified_at") or data.get("listing_date")
                })

            # Step 4: Auction Won (Single event immediately after Auction Started)
            w_name = data.get("winner_name") or data.get("dealer_name")
            w_price = data.get("winning_bid") or data.get("highest_bid")
            w_role = str(data.get("winner_role") or "Dealer").capitalize()
            if w_name and w_price:
                p_val = float(w_price)
                p_str = int(p_val) if p_val.is_integer() else p_val
                history_records.append({
                    "id": "step-4",
                    "crop_id": c_id,
                    "traceability_id": clean_tid,
                    "performed_by": w_name,
                    "role": w_role,
                    "action": "Auction Won",
                    "price": w_price,
                    "location": f"{data.get('district')}, {data.get('state')}",
                    "remarks": f"This auction was won by {w_name} ({w_role}) with the highest bid of ₹{p_str}.",
                    "status": "Auction Completed",
                    "created_at": data.get("winning_timestamp") or data.get("listing_date")
                })

            # Step 5: Retailer Received (if applicable)
            if data.get("retailer_name"):
                history_records.append({
                    "id": "step-5",
                    "crop_id": c_id,
                    "traceability_id": clean_tid,
                    "performed_by": data.get("retailer_name"),
                    "role": "Retailer",
                    "action": "Retailer Purchased",
                    "price": data.get("retailer_purchase_price"),
                    "location": f"Retail Outlet, {data.get('district')}",
                    "remarks": f"Added to retailer stock at selling price ₹{data.get('retail_selling_price')}",
                    "status": "Purchased by Retailer",
                    "created_at": data.get("listing_date")
                })

            # Step 6: Customer Purchased (if applicable)
            if data.get("customer_name"):
                history_records.append({
                    "id": "step-6",
                    "crop_id": c_id,
                    "traceability_id": clean_tid,
                    "performed_by": data.get("customer_name"),
                    "role": "Customer",
                    "action": "Customer Purchased",
                    "price": data.get("customer_purchase_price"),
                    "location": "Customer Delivery Location",
                    "remarks": "Order completed and delivered to customer",
                    "status": "Purchased by Customer",
                    "created_at": data.get("purchase_date") or data.get("listing_date")
                })

        # Ensure single 'Auction Won' event is present and correctly formatted immediately after 'Auction Started'
        if history_records and details_data:
            w_name = details_data.get("winner_name") or details_data.get("dealer_name")
            w_price = details_data.get("winning_bid") or details_data.get("highest_bid")
            is_closed = (details_data.get("auction_status") == "closed")

            won_index = -1
            for idx, rec in enumerate(history_records):
                if str(rec.get("action", "")).strip().lower() == "auction won":
                    won_index = idx
                    break

            if won_index != -1:
                # Format existing Auction Won record strictly
                rec = history_records[won_index]
                act_user = rec.get("performed_by") or w_name or "Winner"
                act_role = str(rec.get("role") or details_data.get("winner_role") or "Dealer").capitalize()
                act_price = rec.get("price") if rec.get("price") is not None else w_price
                if act_price is not None:
                    p_val = float(act_price)
                    p_str = int(p_val) if p_val.is_integer() else p_val
                else:
                    p_str = "N/A"
                rec["performed_by"] = act_user
                rec["role"] = act_role
                rec["status"] = "Auction Completed"
                rec["remarks"] = f"This auction was won by {act_user} ({act_role}) with the highest bid of ₹{p_str}."
            elif (w_name or is_closed) and w_price:
                w_name = w_name or "Winner"
                w_role = str(details_data.get("winner_role") or "Dealer").capitalize()
                p_val = float(w_price)
                p_str = int(p_val) if p_val.is_integer() else p_val

                won_event = {
                    "id": "step-auction-won",
                    "crop_id": crop_id_val,
                    "traceability_id": canonical_tid,
                    "performed_by": w_name,
                    "role": w_role,
                    "action": "Auction Won",
                    "price": w_price,
                    "location": f"{details_data.get('district') or 'Karnataka'}, Karnataka",
                    "remarks": f"This auction was won by {w_name} ({w_role}) with the highest bid of ₹{p_str}.",
                    "status": "Auction Completed",
                    "created_at": details_data.get("winning_timestamp") or details_data.get("listing_date") or datetime.datetime.now(datetime.timezone.utc).isoformat()
                }

                # Find index of Auction Started
                started_idx = -1
                for i, r in enumerate(history_records):
                    if str(r.get("action", "")).strip().lower() == "auction started":
                        started_idx = i
                        break

                if started_idx != -1:
                    history_records.insert(started_idx + 1, won_event)
                else:
                    history_records.append(won_event)

        return jsonify({
            "success": True,
            "traceability_id": clean_tid,
            "history": history_records
        })

    except Exception as e:
        print(f"[Traceability History Error] {e}")
        return jsonify({"success": False, "message": str(e)}), 500


@traceability_bp.route("/traceability/search/<query>", methods=["GET"])
@traceability_bp.route("/api/traceability/search/<query>", methods=["GET"])
def search_traceability(query):
    try:
        clean_q = str(query).strip()

        # Search in crop_qr
        qr_res = supabase.table("crop_qr").select("qr_traceability_id, crop_id").ilike("qr_traceability_id", f"%{clean_q}%").execute()
        if qr_res.data and len(qr_res.data) > 0:
            match = qr_res.data[0]
            return jsonify({
                "success": True,
                "found": True,
                "traceability_id": match.get("qr_traceability_id"),
                "crop_id": match.get("crop_id")
            })

        # Search in crops by ID or qr_traceability_id or crop_name
        filter_expr = f"id.eq.{clean_q},qr_traceability_id.ilike.%{clean_q}%,crop_name.ilike.%{clean_q}%" if clean_q.isdigit() else f"qr_traceability_id.ilike.%{clean_q}%,crop_name.ilike.%{clean_q}%"
        crop_res = supabase.table("crops").select("id, qr_traceability_id, crop_name").or_(filter_expr).execute()
        if crop_res.data and len(crop_res.data) > 0:
            c = crop_res.data[0]
            tid = c.get("qr_traceability_id") or c.get("id")
            return jsonify({
                "success": True,
                "found": True,
                "traceability_id": tid,
                "crop_id": c.get("id")
            })

        return jsonify({"success": False, "found": False, "message": "No matching crop traceability record found"}), 404

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

import os
import uuid
import qrcode
import secrets
from io import BytesIO
from datetime import datetime

from flask import Blueprint, jsonify, request
from supabase import create_client
from dotenv import load_dotenv
from traceability import log_traceability_event

load_dotenv()

# ==========================================
# SUPABASE SETUP
# ==========================================
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("WARNING: Supabase URL or Key not set. Payment module may fail.")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

# ==========================================
# BLUEPRINT
# ==========================================
payment_bp = Blueprint("payment", __name__)

# ==========================================
# HELPER FUNCTIONS
# ==========================================

def generate_secure_token():
    return secrets.token_hex(16)

def upload_file_to_supabase(bucket_name, file, folder=""):
    try:
        # Avoid issues with missing supabase client in test environments
        if not supabase: return "https://mock-url.com/mock.png"

        file_extension = file.filename.split('.')[-1]
        filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = f"{folder}/{filename}" if folder else filename
        
        file_bytes = file.read()
        
        supabase.storage.from_(bucket_name).upload(
            file_path,
            file_bytes,
            {"content-type": file.content_type}
        )
        
        public_url = supabase.storage.from_(bucket_name).get_public_url(file_path)
        return public_url
    except Exception as e:
        print("UPLOAD ERROR:", e)
        return None

def upload_bytes_to_supabase(bucket_name, file_bytes, filename, content_type="image/png"):
    try:
        if not supabase: return "https://mock-url.com/mock.png"

        supabase.storage.from_(bucket_name).upload(
            filename,
            file_bytes,
            {"content-type": content_type}
        )
        return supabase.storage.from_(bucket_name).get_public_url(filename)
    except Exception as e:
        print("UPLOAD ERROR:", e)
        return None

def generate_delivery_qr(qr_data, delivery_id):
    try:
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        image = qr.make_image(fill_color="black", back_color="white")
        img_buffer = BytesIO()
        image.save(img_buffer)
        
        qr_filename = f"delivery_qr_{delivery_id}.png"
        
        qr_url = upload_bytes_to_supabase(
            "delivery-proofs",
            img_buffer.getvalue(),
            qr_filename
        )
        
        print(f"DEBUG: Generated QR URL: {qr_url}")
        return qr_url
    except Exception as e:
        print("QR GENERATION ERROR:", e)
        return None

def create_notification_record(user_id, user_role, title, message, crop_id=None, auction_id=None):
    try:
        # Avoid issues with missing supabase client
        if not supabase: return

        query = supabase.table("auction_notifications").select("*").eq("user_id", user_id).eq("user_role", user_role).eq("title", title)
        if crop_id:
            query = query.eq("crop_id", crop_id)
        existing = query.execute()
        if existing.data and len(existing.data) > 0:
            return

        supabase.table("auction_notifications").insert({
            "user_id": user_id,
            "user_role": user_role,
            "title": title,
            "message": message,
            "crop_id": crop_id,
            "created_at": datetime.utcnow().isoformat()
        }).execute()
    except Exception as e:
        print(f"DEBUG: Failed to create notification record: {str(e)}")

def sync_auction_to_retailer_inventory(auction_id):
    try:
        if not auction_id or not supabase:
            return
        auction_res = supabase.table("completed_auction_results").select("*").eq("auction_id", int(auction_id)).execute()
        if auction_res.data:
            auction_data = auction_res.data[0]
            winner_role = str(auction_data.get("winner_role", "")).lower()
            winner_id = auction_data.get("winner_id")

            if winner_role == "retailer" and winner_id:
                try:
                    winner_id_int = int(winner_id)
                    auction_id_int = int(auction_id)
                except (ValueError, TypeError):
                    return

                existing = supabase.table("retailer_inventory").select("*").eq("auction_id", auction_id_int).execute()
                if not existing.data:
                    crop_qty = str(auction_data.get("crop_quantity") or auction_data.get("quantity") or "0").strip()
                    qty_parts = crop_qty.split(" ")
                    try:
                        qty_val = float(qty_parts[0]) if qty_parts and qty_parts[0] else 0.0
                    except (ValueError, TypeError):
                        qty_val = 0.0
                    qty_unit = qty_parts[1] if len(qty_parts) > 1 else (auction_data.get("unit") or "kg")

                    crop_id_val = auction_data.get("crop_id")
                    valid_uuid = None
                    if crop_id_val:
                        try:
                            import uuid
                            uuid.UUID(str(crop_id_val))
                            valid_uuid = str(crop_id_val)
                        except Exception:
                            valid_uuid = None

                    new_item = {
                        "retailer_id": winner_id_int,
                        "crop_id": valid_uuid,
                        "crop_name": str(auction_data.get("crop_name") or "N/A"),
                        "quantity_available": qty_val,
                        "unit": str(qty_unit),
                        "purchase_price": float(auction_data.get("final_bid") or 0),
                        "selling_price": float(auction_data.get("final_bid") or 0),
                        "farmer_name": str(auction_data.get("farmer_name") or "N/A"),
                        "auction_id": auction_id_int
                    }

                    res = supabase.table("retailer_inventory").insert(new_item).execute()
                    print(f"[RETAILER INVENTORY INSERTED] Auction {auction_id_int} added for retailer {winner_id_int}: {res.data}")
    except Exception as inv_err:
        print("[ERROR SYNCING RETAILER INVENTORY]:", inv_err)

# ==========================================
# FEATURE 1: ADMIN CONTROL BUTTONS - Request Farmer Payment QR
# ==========================================
@payment_bp.route("/api/payment/admin/request-farmer-qr", methods=["POST"])
def admin_request_farmer_qr():
    try:
        data = request.json
        auction_id = data.get("auction_id")
        farmer_id = data.get("farmer_id")
        dealer_id = data.get("dealer_id")

        if not all([auction_id, farmer_id, dealer_id]):
            return jsonify({"success": False, "message": "Missing required fields"}), 400

        # Cast IDs to int
        try:
            auction_id = int(auction_id)
            farmer_id = int(farmer_id)
            dealer_id = int(dealer_id)
        except (TypeError, ValueError):
            pass

        # Upsert into auction_payments
        existing = supabase.table("auction_payments").select("*").eq("auction_id", auction_id).execute()
        
        if not existing.data:
            supabase.table("auction_payments").insert({
                "auction_id": auction_id,
                "farmer_id": farmer_id,
                "dealer_id": dealer_id,
                "farmer_qr_enabled": True,
                "delivery_status": "Waiting For Farmer Payment QR"
            }).execute()
        else:
            supabase.table("auction_payments").update({
                "farmer_qr_enabled": True,
                "delivery_status": "Waiting For Farmer Payment QR"
            }).eq("auction_id", auction_id).execute()

        # Update completed_auction_results
        supabase.table("completed_auction_results").update({
            "farmer_qr_enabled": True
        }).eq("auction_id", auction_id).execute()

        return jsonify({"success": True, "message": "Farmer payment QR upload enabled."}), 200
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": str(e)}), 500

# ==========================================
# FEATURE 2: ADMIN ESCROW PAYMENT QR
# ==========================================
@payment_bp.route("/api/payment/admin/upload-escrow-qr", methods=["POST"])
def admin_upload_escrow_qr():
    try:
        qr_image = request.files.get("escrow_qr")
        if not qr_image:
            return jsonify({"success": False, "message": "No QR image provided"}), 400

        qr_url = upload_file_to_supabase("payment-qrs", qr_image, "admin_escrow")
        if not qr_url:
            return jsonify({"success": False, "message": "Failed to upload image"}), 500

        # Disable old QRs
        supabase.table("admin_escrow_qr").update({"is_active": False}).neq("is_active", False).execute()
        
        # Insert new active QR
        supabase.table("admin_escrow_qr").insert({
            "qr_url": qr_url,
            "is_active": True
        }).execute()

        return jsonify({"success": True, "message": "Escrow QR updated successfully", "qr_url": qr_url}), 200
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": str(e)}), 500

@payment_bp.route("/api/payment/admin/escrow-qr", methods=["GET"])
def get_admin_escrow_qr():
    try:
        response = supabase.table("admin_escrow_qr").select("*").eq("is_active", True).execute()
        if response.data:
            return jsonify({"success": True, "qr_url": response.data[0]["qr_url"]}), 200
        return jsonify({"success": False, "message": "No active escrow QR found"}), 404
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": str(e)}), 500

# ==========================================
# FEATURE 4: FARMER PAYMENT QR UPLOAD
# ==========================================
@payment_bp.route("/api/payment/farmer/upload-qr", methods=["POST"])
def farmer_upload_qr():
    try:
        auction_id = request.form.get("auction_id")
        qr_image = request.files.get("qr_image")
        
        if not all([auction_id, qr_image]):
            return jsonify({"success": False, "message": "Missing auction_id or qr_image"}), 400

        auction_id = int(auction_id)

        # Check if enabled
        payment_record = supabase.table("auction_payments").select("farmer_qr_enabled").eq("auction_id", auction_id).execute()
        if not payment_record.data or not payment_record.data[0]["farmer_qr_enabled"]:
            return jsonify({"success": False, "message": "QR upload is locked for this auction."}), 403

        qr_url = upload_file_to_supabase("payment-qrs", qr_image, "farmer_qr")
        if not qr_url:
            return jsonify({"success": False, "message": "Failed to upload image"}), 500

        supabase.table("auction_payments").update({
            "farmer_qr_url": qr_url,
            "delivery_status": "Waiting For Escrow Payment",
            "updated_at": datetime.utcnow().isoformat()
        }).eq("auction_id", auction_id).execute()

        return jsonify({"success": True, "qr_url": qr_url, "message": "Farmer Payment QR uploaded successfully"}), 200
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": str(e)}), 500

@payment_bp.route("/api/payment/farmer-qr/<auction_id>", methods=["GET"])
def get_farmer_qr(auction_id):
    try:
        auction_id = int(auction_id)
        response = supabase.table("auction_payments").select("farmer_qr_url").eq("auction_id", auction_id).execute()
        if response.data and response.data[0]["farmer_qr_url"]:
            # Return in a list to match the frontend's response.data[0] expectation
            return jsonify([{"qr_url": response.data[0]["farmer_qr_url"]}]), 200
        return jsonify([]), 200
    except Exception as e:
        print(e)
        return jsonify([]), 500

# ==========================================
# FEATURE 1: ADMIN ENABLE ESCROW PAYMENT (BUTTON 2)
# ==========================================
@payment_bp.route("/api/payment/admin/enable-escrow", methods=["POST"])
def admin_enable_escrow():
    try:
        data = request.json
        auction_id = data.get("auction_id")
        
        if not auction_id:
            return jsonify({"success": False, "message": "Missing auction_id"}), 400

        auction_id = int(auction_id)

        print(f"ENABLING ESCROW FOR AUCTION: {auction_id}")
        res1 = supabase.table("auction_payments").update({
            "escrow_enabled": True,
            "delivery_status": "Waiting For Dealer Payment",
            "updated_at": datetime.utcnow().isoformat()
        }).eq("auction_id", auction_id).execute()
        print(f"AUCTION_PAYMENTS UPDATE: {res1.data}")

        # Update completed_auction_results
        res2 = supabase.table("completed_auction_results").update({
            "escrow_enabled": True
        }).eq("auction_id", auction_id).execute()
        print(f"COMPLETED_AUCTION_RESULTS UPDATE: {res2.data}")

        return jsonify({"success": True, "message": "Escrow payment enabled for dealer."}), 200
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": str(e)}), 500

# ==========================================
# FEATURE 6: ESCROW PAYMENT PAGE DETAILS
# ==========================================
@payment_bp.route("/api/payment/dealer/escrow-details/<auction_id>", methods=["GET"])
def get_escrow_details(auction_id):
    try:
        # Check if enabled
        payment_record = supabase.table("auction_payments").select("*").eq("auction_id", auction_id).execute()
        if not payment_record.data or not payment_record.data[0]["escrow_enabled"]:
            return jsonify({"success": False, "message": "Payment not enabled yet."}), 403

        # Get active admin QR
        admin_qr_record = supabase.table("admin_escrow_qr").select("*").eq("is_active", True).execute()
        admin_qr = admin_qr_record.data[0]["qr_url"] if admin_qr_record.data else None

        # Normally we would fetch auction details, crop details, farmer details here via joins or multiple queries
        # Assuming frontend gets those basic details already or we fetch a consolidated view
        # Fetch auction details with crop join
        auction_details = supabase.table("crop_auctions").select("*, crops(*)").eq("id", int(auction_id)).execute()
        
        return jsonify({
            "success": True,
            "admin_qr": admin_qr,
            "payment_record": payment_record.data[0],
            "auction_data": auction_details.data[0] if auction_details.data else None
        }), 200
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": str(e)}), 500

# ==========================================
# FEATURE 7: DEALER PAYMENT PROOF SUBMISSION
# ==========================================
@payment_bp.route("/api/payment/submit-payment-proof", methods=["POST"])
def submit_payment_proof():
    try:
        auction_id = request.form.get("auction_id")
        utr_number = request.form.get("utr_number")
        remarks = request.form.get("remarks")
        screenshot = request.files.get("payment_screenshot")
        
        if not all([auction_id, utr_number, screenshot]):
            return jsonify({"success": False, "message": "Missing required fields"}), 400

        auction_id = int(auction_id)

        # Check if escrow is enabled
        payment_record = supabase.table("auction_payments").select("escrow_enabled").eq("auction_id", auction_id).execute()
        if not payment_record.data or not payment_record.data[0]["escrow_enabled"]:
            return jsonify({"success": False, "message": "Payment not enabled yet."}), 403

        screenshot_url = upload_file_to_supabase("payment-proofs", screenshot, "payment_proofs")
        if not screenshot_url:
            return jsonify({"success": False, "message": "Failed to upload screenshot"}), 500

        supabase.table("auction_payments").update({
            "utr_number": utr_number,
            "transaction_remarks": remarks,
            "payment_screenshot_url": screenshot_url,
            "payment_timestamp": datetime.utcnow().isoformat(),
            "delivery_status": "Escrow Payment Submitted",
            "updated_at": datetime.utcnow().isoformat()
        }).eq("auction_id", auction_id).execute()

        return jsonify({"success": True, "message": "Payment proof submitted successfully"}), 200
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": str(e)}), 500

# ==========================================
# FEATURE 8: ADMIN PENDING ESCROW PAYMENTS & VERIFICATION
# ==========================================
@payment_bp.route("/api/payment/admin/pending-payments", methods=["GET"])
def admin_pending_payments():
    try:
        response = supabase.table("auction_payments").select("*")\
            .eq("payment_verified", False)\
            .not_.is_("payment_screenshot_url", "null")\
            .execute()
        return jsonify({"success": True, "data": response.data}), 200
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": str(e)}), 500

@payment_bp.route("/api/payment/admin/verify-payment", methods=["POST"])
def admin_verify_payment():
    try:
        data = request.json
        auction_id = data.get("auction_id")
        is_verified = data.get("is_verified", True) # boolean indicating verify or reject
        
        if not auction_id:
            return jsonify({"success": False, "message": "Missing auction_id"}), 400

        auction_id = int(auction_id)

        if is_verified:
            supabase.table("auction_payments").update({
                "payment_verified": True,
                "verified_at": datetime.utcnow().isoformat(),
                "delivery_status": "Payment Verified",
                "updated_at": datetime.utcnow().isoformat()
            }).eq("auction_id", auction_id).execute()
            msg = "Payment verified successfully."
            sync_auction_to_retailer_inventory(auction_id)

            try:
                auc_res = supabase.table("crop_auctions").select("crop_id").eq("id", auction_id).execute()
                if auc_res.data:
                    c_id = auc_res.data[0].get("crop_id")
                    pay_rec = supabase.table("auction_payments").select("winning_bid_amount, dealer_name").eq("auction_id", auction_id).execute()
                    dealer_name = pay_rec.data[0].get("dealer_name") if pay_rec.data else "Dealer"
                    price = pay_rec.data[0].get("winning_bid_amount") if pay_rec.data else None
                    log_traceability_event(
                        crop_id=c_id,
                        traceability_id=None,
                        performed_by=dealer_name,
                        role="Dealer",
                        action="Dealer Purchased",
                        price=price,
                        location="Karnataka APMC Mandi",
                        remarks="Escrow payment verified by Admin. Crop ownership transferred to dealer.",
                        status="Sold to Dealer"
                    )
            except Exception as log_err:
                print(f"[Traceability Log Error] {log_err}")
        else:
            # Reject logic
            supabase.table("auction_payments").update({
                "payment_verified": False,
                "payment_screenshot_url": None, # Clear proof so they can re-upload
                "delivery_status": "Waiting For Escrow Payment",
                "updated_at": datetime.utcnow().isoformat()
            }).eq("auction_id", auction_id).execute()
            msg = "Payment rejected. Dealer must upload again."

        return jsonify({"success": True, "message": msg}), 200
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": str(e)}), 500

# ==========================================
# FEATURE 9: ENABLE FARMER CROP DISPATCH (BUTTON 3)
# ==========================================
@payment_bp.route("/api/payment/admin/enable-dispatch", methods=["POST"])
def admin_enable_dispatch():
    try:
        data = request.json
        auction_id = data.get("auction_id")
        
        if not auction_id:
            return jsonify({"success": False, "message": "Missing auction_id"}), 400

        auction_id = int(auction_id)

        print(f"ENABLING DISPATCH FOR AUCTION: {auction_id}")
        res1 = supabase.table("auction_payments").update({
            "dispatch_enabled": True,
            "delivery_status": "Waiting For Crop Dispatch",
            "updated_at": datetime.utcnow().isoformat()
        }).eq("auction_id", auction_id).execute()
        print(f"AUCTION_PAYMENTS UPDATE: {res1.data}")

        # Update completed_auction_results
        res2 = supabase.table("completed_auction_results").update({
            "send_crops_enabled": True
        }).eq("auction_id", auction_id).execute()
        print(f"COMPLETED_AUCTION_RESULTS UPDATE: {res2.data}")

        return jsonify({"success": True, "message": "Farmer notified to send crops."}), 200
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": str(e)}), 500

# ==========================================
# FEATURE 10 & 11: FARMER CROP DISPATCH & DELIVERY QR GENERATION
# ==========================================
@payment_bp.route("/api/payment/farmer/dispatch", methods=["POST"])
@payment_bp.route("/api/payment/send-crops", methods=["POST"])
def farmer_dispatch_crops():
    try:
        auction_id = request.form.get("auction_id")
        farmer_id = request.form.get("farmer_id")
        dealer_id = request.form.get("dealer_id")
        crop_id = request.form.get("crop_id")
        
        traveler_number = request.form.get("traveler_number")
        delivery_person = request.form.get("delivery_person_name")
        vehicle_number = request.form.get("vehicle_number")
        dispatch_notes = request.form.get("dispatch_notes", "")
        
        loading_image = request.files.get("loading_image")
        delivery_proof = request.files.get("delivery_proof")
        transport_receipt = request.files.get("transport_receipt")

        required_fields = {
            "auction_id": auction_id,
            "farmer_id": farmer_id,
            "dealer_id": dealer_id,
            "crop_id": crop_id,
            "traveler_number": traveler_number,
            "delivery_person_name": delivery_person,
            "vehicle_number": vehicle_number,
            "loading_image": loading_image,
            "delivery_proof": delivery_proof,
            "transport_receipt": transport_receipt
        }
        
        missing = [k for k, v in required_fields.items() if not v]
        if missing:
            return jsonify({"success": False, "message": f"Missing fields: {', '.join(missing)}"}), 400

        auction_id = int(auction_id)

        # Check if enabled
        payment_record = supabase.table("auction_payments").select("dispatch_enabled").eq("auction_id", auction_id).execute()
        if not payment_record.data or not payment_record.data[0]["dispatch_enabled"]:
            return jsonify({"success": False, "message": "Dispatch is locked."}), 403

        # Upload images
        loading_url = upload_file_to_supabase("delivery-proofs", loading_image, "loading_images")
        proof_url = upload_file_to_supabase("delivery-proofs", delivery_proof, "proof_images")
        receipt_url = upload_file_to_supabase("delivery-proofs", transport_receipt, "receipt_images")
        
        if not all([loading_url, proof_url, receipt_url]):
            return jsonify({"success": False, "message": "Failed to upload one or more dispatch images"}), 500

        # GENERATE SECURE TOKEN AND QR
        verification_token = generate_secure_token()
        delivery_id = str(uuid.uuid4())
        
        qr_payload = f"auction_id:{auction_id},crop_id:{crop_id},farmer_id:{farmer_id},dealer_id:{dealer_id},delivery_id:{delivery_id},token:{verification_token}"
        delivery_qr_url = generate_delivery_qr(qr_payload, delivery_id)
        
        if not delivery_qr_url:
            return jsonify({"success": False, "message": "Failed to generate Delivery QR"}), 500

        # Insert into crop_deliveries
        supabase.table("crop_deliveries").insert({
            "id": delivery_id,
            "auction_id": auction_id,
            "farmer_id": farmer_id,
            "dealer_id": dealer_id,
            "crop_id": crop_id,
            "traveler_number": traveler_number,
            "delivery_person_name": delivery_person,
            "vehicle_number": vehicle_number,
            "dispatch_notes": dispatch_notes,
            "loading_image_url": loading_url,
            "delivery_proof_url": proof_url,
            "transport_receipt_url": receipt_url,
            "delivery_qr_url": delivery_qr_url,
            "verification_token": verification_token
        }).execute()

        # Update status
        supabase.table("auction_payments").update({
            "delivery_status": "Delivery QR Generated",
            "updated_at": datetime.utcnow().isoformat()
        }).eq("auction_id", auction_id).execute()

        return jsonify({
            "success": True, 
            "message": "Crops dispatched successfully and Delivery QR generated",
            "qr_url": delivery_qr_url,
            "delivery_id": delivery_id
        }), 200

    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": str(e)}), 500

# ==========================================
# FEATURE 13: ADMIN DELIVERY TRACKING
# ==========================================
@payment_bp.route("/api/payment/admin/deliveries", methods=["GET"])
def admin_get_deliveries():
    try:
        response = supabase.table("crop_deliveries").select("*").execute()
        return jsonify({"success": True, "data": response.data}), 200
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": str(e)}), 500

# ==========================================
# DEALER VERIFY DELIVERY QR
# ==========================================
@payment_bp.route("/api/payment/dealer/verify-delivery-qr", methods=["POST"])
def dealer_verify_delivery_qr():
    try:
        data = request.json
        auction_id = data.get("auction_id")
        verification_token = data.get("token")
        
        if not auction_id or not verification_token:
            return jsonify({"success": False, "message": "Missing QR verification data"}), 400
            
        auction_id = int(auction_id)

        delivery_record = supabase.table("crop_deliveries").select("*").eq("auction_id", auction_id).eq("verification_token", verification_token).execute()
        
        if not delivery_record.data:
            return jsonify({"success": False, "message": "Invalid QR code or token mismatch"}), 400
            
        if delivery_record.data[0].get("delivery_completed"):
            return jsonify({"success": False, "message": "This delivery QR has already been verified"}), 400
            
        # Mark delivery completed
        supabase.table("crop_deliveries").update({
            "delivery_completed": True
        }).eq("auction_id", auction_id).execute()
        
        # Update auction payments status
        supabase.table("auction_payments").update({
            "delivery_status": "QR Verified",
            "updated_at": datetime.utcnow().isoformat()
        }).eq("auction_id", auction_id).execute()

        # Update retailer inventory if winner is a retailer
        sync_auction_to_retailer_inventory(auction_id)
        
        return jsonify({"success": True, "message": "Delivery successfully verified!"}), 200
        
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": str(e)}), 500

# ==========================================
# ADMIN FINALIZE TRANSACTION
# ==========================================
@payment_bp.route("/api/payment/admin/finalize-transaction", methods=["POST"])
def admin_finalize_transaction():
    try:
        data = request.json
        auction_id = data.get("auction_id")
        
        if not auction_id:
            return jsonify({"success": False, "message": "Missing auction_id"}), 400
            
        auction_id = int(auction_id)

        supabase.table("auction_payments").update({
            "delivery_status": "Amount Transferred",
            "updated_at": datetime.utcnow().isoformat()
        }).eq("auction_id", auction_id).execute()
        
        # Update completed_auction_results
        supabase.table("completed_auction_results").update({
            "escrow_status": "Transaction Completed"
        }).eq("auction_id", auction_id).execute()

        # Update retailer inventory if winner is a retailer
        sync_auction_to_retailer_inventory(auction_id)

        # ==========================================
        # NOTIFY FARMER AND DEALER
        # ==========================================
        try:
            # Fetch details for notification
            auction_res = supabase.table("completed_auction_results").select("*").eq("auction_id", auction_id).execute()
            if auction_res.data:
                data = auction_res.data[0]
                farmer_id = data.get("farmer_id")
                winner_id = data.get("winner_id")
                winner_role = data.get("winner_role")
                crop_name = data.get("crop_name")
                amount = data.get("final_bid")
                crop_id = data.get("crop_id")

                # Notify Farmer
                create_notification_record(
                    user_id=farmer_id,
                    user_role="farmer",
                    title="Payment Received",
                    message=f"Success! Your crop delivery for {crop_name} has been verified and the payment of ₹{amount} has been transferred to your account.",
                    crop_id=crop_id
                )

                # Notify Dealer/Retailer
                create_notification_record(
                    user_id=winner_id,
                    user_role=winner_role,
                    title="Transaction Completed",
                    message=f"The transaction for {crop_name} is complete. The payment of ₹{amount} has been released to the farmer following successful delivery.",
                    crop_id=crop_id
                )
        except Exception as notify_err:
            print(f"NOTIFICATION ERROR: {notify_err}")

        return jsonify({"success": True, "message": "Amount transferred and transaction finalized"}), 200
        
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": str(e)}), 500

# ==========================================
# GET PAYMENT TIMELINE
# ==========================================
@payment_bp.route("/api/payment/timeline/<auction_id>", methods=["GET"])
def get_payment_timeline(auction_id):
    try:
        auction_id = int(auction_id)
        payment_res = supabase.table("auction_payments").select("*").eq("auction_id", auction_id).execute()
        
        if not payment_res.data:
            # Maybe the auction isn't in auction_payments yet
            return jsonify({"success": True, "status": "Not Started"}), 200
            
        payment = payment_res.data[0]
        return jsonify({"success": True, "status": payment.get("delivery_status"), "payment": payment}), 200
        
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": str(e)}), 500
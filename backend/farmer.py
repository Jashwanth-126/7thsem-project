from flask import Blueprint, request, jsonify
from supabase import create_client
from dotenv import load_dotenv

import os
import uuid
import qrcode
import io
import base64
from traceability import log_traceability_event

load_dotenv()

# ==========================================
# BLUEPRINT
# ==========================================

farmer_bp = Blueprint(
    "farmer",
    __name__
)

# ==========================================
# SUPABASE CONFIG
# ==========================================

SUPABASE_URL = os.getenv(
    "SUPABASE_URL"
)

SUPABASE_KEY = os.getenv(
    "SUPABASE_KEY"
)

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)

# ==========================================
# FARMER DASHBOARD
# ==========================================

@farmer_bp.route(
    "/api/farmer/dashboard/<int:farmer_id>",
    methods=["GET"]
)
def farmer_dashboard(farmer_id):

    try:

        farmer = supabase.table(
            "farmers"
        ).select("*").eq(
            "id",
            farmer_id
        ).execute()

        crops = supabase.table(
            "crops"
        ).select("*").eq(
            "farmer_id",
            farmer_id
        ).execute()

        crop_images = supabase.table(
            "crop_images"
        ).select("*").execute()

        crop_qr = supabase.table(
            "crop_qr"
        ).select("*").execute()

        # ==================================
        # JOIN IMAGE URLs & QR CODES WITH CROPS
        # ==================================
        
        image_map = {
            str(img.get("crop_id")): img.get("image_url", "") 
            for img in (crop_images.data or [])
        }
        
        qr_map = {
            str(qr.get("crop_id")): qr 
            for qr in (crop_qr.data or [])
        }
        
        for crop in (crops.data or []):
            c_id_str = str(crop.get("id"))
            crop["image_url"] = image_map.get(c_id_str, "")
            
            qr_item = qr_map.get(c_id_str, {})
            crop["qr_base64"] = qr_item.get("qr_base64")
            crop["qr_traceability_id"] = crop.get("qr_traceability_id") or qr_item.get("qr_traceability_id") or f"KM-TRC-{c_id_str[:8].upper()}"
            
            # If qr_base64 is missing, generate on-the-fly and persist
            if not crop.get("qr_base64"):
                try:
                    tid = crop["qr_traceability_id"]
                    qr_text = f"Farmer Name: {crop.get('farmer_name', '')}\nCrop Name: {crop.get('crop_name', '')}\nQuantity: {crop.get('quantity', '')} {crop.get('unit', '')}\nDistrict: {crop.get('district', '')}\nHarvest Date: {crop.get('harvest_date', '')}\nTraceability ID: {tid}"
                    qr_img = qrcode.make(qr_text)
                    buf = io.BytesIO()
                    qr_img.save(buf, format="PNG")
                    b64 = base64.b64encode(buf.getvalue()).decode()
                    crop["qr_base64"] = f"data:image/png;base64,{b64}"
                    
                    try:
                        supabase.table("crop_qr").insert({
                            "crop_id": crop.get("id"),
                            "qr_traceability_id": tid,
                            "qr_base64": crop["qr_base64"]
                        }).execute()
                    except Exception:
                        pass
                except Exception as qr_err:
                    print("ON-THE-FLY QR ERROR:", qr_err)

        return jsonify({

            "success": True,

            "farmer":
                farmer.data,

            "total_crops":
                len(crops.data),

            "crops":
                crops.data,

            "crop_images":
                crop_images.data,

            "crop_qr":
                crop_qr.data
        })

    except Exception as e:

        return jsonify({

            "success": False,

            "message":
                str(e)

        }), 500

# ==========================================
# ADD CROP
# ==========================================

@farmer_bp.route(
    "/api/farmer/add-crop",
    methods=["POST"]
)
def add_crop():

    try:

        farmer_id = request.form.get(
            "farmer_id"
        )

        farmer_name = request.form.get(
            "farmer_name"
        )

        district = request.form.get(
            "district"
        )

        crop_name = request.form.get(
            "crop_name"
        )

        crop_category = request.form.get(
            "crop_category"
        )

        crop_variety = request.form.get(
            "crop_variety"
        )

        quantity = request.form.get(
            "quantity"
        )

        unit = request.form.get(
            "unit"
        )

        expected_price = request.form.get(
            "expected_price"
        )

        harvest_date = request.form.get(
            "harvest_date"
        )

        pickup_option = request.form.get(
            "pickup_option"
        )

        image = request.files.get(
            "image"
        )

        # ==================================
        # TRACEABILITY ID
        # ==================================

        traceability_id = str(
            uuid.uuid4()
        )[:8]

        # ==================================
        # INSERT CROP
        # ==================================

        crop_response = supabase.table(
            "crops"
        ).insert({

            "farmer_id":
                farmer_id,

            "farmer_name":
                farmer_name,

            "district":
                district,

            "crop_name":
                crop_name,

            "crop_category":
                crop_category,

            "crop_variety":
                crop_variety,

            "quantity":
                quantity,

            "unit":
                unit,

            "expected_price":
                expected_price,

            "harvest_date":
                harvest_date,

            "pickup_option":
                pickup_option,

            "qr_traceability_id":
                traceability_id

        }).execute()

        crop_id = crop_response.data[0]["id"]

        image_url = ""

        # ==================================
        # IMAGE VALIDATION + UPLOAD
        # ==================================

        if image:

            file_ext = image.filename.split(".")[-1]

            allowed_extensions = [
                "png",
                "jpg",
                "jpeg"
            ]

            if file_ext.lower() not in allowed_extensions:

                return jsonify({

                    "success": False,

                    "message":
                        "Invalid image type"

                }), 400

            file_name = (
                f"{traceability_id}.{file_ext}"
            )

            supabase.storage \
                .from_("crop-images") \
                .upload(
                    file_name,
                    image.read()
                )

            image_url = (
                f"{SUPABASE_URL}/storage/v1/object/public/crop-images/{file_name}"
            )

            # SAVE IMAGE URL
            supabase.table(
                "crop_images"
            ).insert({

                "crop_id":
                    crop_id,

                "image_url":
                    image_url

            }).execute()

        # ==================================
        # QR CODE GENERATION
        # ==================================

        qr_data = f"""
Farmer Name: {farmer_name}

Crop Name: {crop_name}

Quantity: {quantity} {unit}

District: {district}

Harvest Date: {harvest_date}

Traceability ID: {traceability_id}
"""

        qr = qrcode.make(qr_data)

        buffer = io.BytesIO()

        qr.save(buffer)

        qr_base64 = base64.b64encode(
            buffer.getvalue()
        ).decode()

        # ==================================
        # SAVE QR
        # ==================================

        supabase.table(
            "crop_qr"
        ).insert({

            "crop_id":
                crop_id,

            "qr_traceability_id":
                traceability_id,

            "qr_base64":
                qr_base64

        }).execute()

        log_traceability_event(
            crop_id=crop_id,
            traceability_id=traceability_id,
            performed_by=farmer_name,
            role="Farmer",
            action="Crop Added",
            price=expected_price,
            location=f"{district}, Karnataka",
            remarks=f"Crop {crop_name} listed by farmer",
            status="Listed"
        )

        return jsonify({

            "success": True,

            "message":
                "Crop Added Successfully",

            "traceability_id":
                traceability_id,

            "image_url":
                image_url,

            "qr_base64":
                qr_base64

        })

    except Exception as e:

        print(
            "ADD CROP ERROR:",
            e
        )

        return jsonify({

            "success": False,

            "message":
                str(e)

        }), 500
    
# ==========================================
# FARMER NOTIFICATIONS
# ==========================================

@farmer_bp.route(

    "/api/farmer/notifications/<int:farmer_id>",

    methods=["GET"]
)
def get_farmer_notifications(farmer_id):
    try:
        # 1. Fetch normal notifications
        normal_notifs = supabase.table("auction_notifications").select("*").eq("farmer_id", farmer_id).execute()
        notifications = normal_notifs.data or []

        # 2. Fetch completed auctions for this farmer
        completed_auctions = supabase.table("completed_auction_results").select("*").eq("farmer_id", farmer_id).execute()
        
        for item in (completed_auctions.data or []):
            auction_id = item.get("auction_id")
            
            # Fetch payment/dispatch status for this auction
            payment_status = supabase.table("auction_payments").select("*").eq("auction_id", auction_id).execute()
            
            status_data = payment_status.data[0] if payment_status.data else {}
            
            notifications.append({
                "id": item.get("id"),
                "auction_id": auction_id,
                "title": "Auction Won",
                "message": f"Auction for {item.get('crop_name')} has been won by {item.get('winner_name')}.",
                "crop_name": item.get("crop_name"),
                "crop_id": item.get("crop_id"),
                "winner_id": item.get("winner_id"),
                "crop_category": item.get("crop_category"),
                "crop_quantity": item.get("crop_quantity"),
                "final_bid": item.get("final_bid"),
                "winner_name": item.get("winner_name"),
                "winner_role": item.get("winner_role"),
                "winner_email": item.get("winner_email"),
                "created_at": item.get("winning_timestamp"),
                # Status fields for Farmer Dashboard buttons
                "farmer_qr_enabled": status_data.get("farmer_qr_enabled", False),
                "send_crops_enabled": status_data.get("dispatch_enabled", False),
                "delivery_status": status_data.get("delivery_status", "Pending")
            })

        # Sort by date
        notifications.sort(key=lambda x: x.get("created_at", ""), reverse=True)

        return jsonify(notifications), 200

    except Exception as e:

        print(

            "FARMER NOTIFICATION ERROR:",
            e

        )

        return jsonify({

            "error": str(e)

        }), 500
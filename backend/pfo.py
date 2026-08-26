
from flask import Blueprint, request, jsonify
from supabase import create_client
from dotenv import load_dotenv

import os
import uuid
import qrcode
import io
import base64
import smtplib
from email.mime.text import MIMEText
from difflib import SequenceMatcher

from datetime import datetime, timedelta
from traceability import log_traceability_event

load_dotenv()

# ==========================================
# BLUEPRINT
# ==========================================

pfo_bp = Blueprint(
    "pfo",
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


def get_user_table_by_role(role):

    if role == "dealer":

        return "dealers"

    if role == "retailer":

        return "retailers"

    if role == "farmer":

        return "farmers"

    return None


def get_user_by_role(user_id, role):

    table = get_user_table_by_role(role)

    if not table:

        return None

    response = supabase.table(
        table
    ).select("*").eq(
        "id",
        user_id
    ).execute()

    return (
        response.data[0]
        if response.data else None
    )


def send_notification_email(
    email,
    subject,
    message
):

    try:

        smtp_host = os.getenv("MAIL_SERVER")
        smtp_port = int(os.getenv("MAIL_PORT", 587))
        smtp_user = os.getenv("MAIL_USERNAME")
        smtp_pass = os.getenv("MAIL_PASSWORD")

        msg = MIMEText(message)
        msg["Subject"] = subject
        msg["From"] = smtp_user
        msg["To"] = email

        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.sendmail(smtp_user, [email], msg.as_string())
        server.quit()

    except Exception as e:

        print("SMTP ERROR:", e)


def create_notification_record(
    user_id,
    user_role,
    title,
    message,
    crop_id=None,
    request_id=None
):
    try:
        query = supabase.table("auction_notifications").select("*").eq("user_id", user_id).eq("user_role", user_role).eq("title", title)
        if crop_id:
            query = query.eq("crop_id", crop_id)
        existing = query.execute()
        if existing.data and len(existing.data) > 0:
            return

        supabase.table(
            "auction_notifications"
        ).insert({

            "user_id":
                user_id,

            "user_role":
                user_role,

            "title":
                title,

            "message":
                message,

            "crop_id":
                crop_id,

            "request_id":
                request_id,

            "created_at":
                datetime.now().isoformat()

        }).execute()
    except Exception as e:
        print(f"Error in create_notification_record: {e}")


def get_or_create_auction(crop_id):

    response = supabase.table(
        "crop_auctions"
    ).select("*").eq(
        "crop_id",
        crop_id
    ).execute()

    if response.data:

        return response.data[0]

    auction_start = datetime.now().isoformat()

    auction_end = (
        datetime.now()
        + timedelta(days=2)
    ).isoformat()

    supabase.table(
        "crop_auctions"
    ).insert({

        "crop_id":
            crop_id,

        "auction_start":
            auction_start,

        "auction_end":
            auction_end,

        "auction_status":
            "active",

        "closed_by_pfo":
            False,

        "created_at":
            auction_start

    }).execute()

    created = supabase.table(
        "crop_auctions"
    ).select("*").eq(
        "crop_id",
        crop_id
    ).execute()

    return (
        created.data[0]
        if created.data else None
    )


def notify_matching_requests(
    crop_data,
    auction_end
):

    try:

        matched = []

        for table, role in [
            ("dealer_crop_requests", "dealer"),
            ("retailer_crop_requests", "retailer")
        ]:

            try:

                requests_response = supabase.table(
                    table
                ).select("*").execute()

                for request in requests_response.data or []:

                    score = SequenceMatcher(
                        None,
                        crop_data["crop_name"].lower().strip(),
                        request["crop_type"].lower().strip()
                    ).ratio()

                    if score >= 0.65:

                        match_score = round(
                            score * 100,
                            2
                        )

                        try:

                            supabase.table(
                                "crop_matches"
                            ).insert({

                                "crop_id":
                                    crop_data["id"],

                                "request_id":
                                    request["id"],

                                "user_id":
                                    request["user_id"],

                                "user_role":
                                    role,

                                "match_score":
                                    match_score,

                                "created_at":
                                    datetime.now().isoformat()

                            }).execute()

                        except Exception as e:

                            print(f"Error inserting crop match: {e}")

                        title = (
                            "Matched crop available for bidding"
                        )

                        message = f"""
A verified crop matching your request is now available for bidding.

Crop: {crop_data.get('crop_name')}
Base price: ₹{crop_data.get('expected_price')}
Quality grade: {crop_data.get('quality_grade')}
Verified by: {crop_data.get('verified_by')}
PFO district: {crop_data.get('verified_district')}
Auction ends: {auction_end}

Please visit the marketplace to place your bid.
"""

                        try:

                            create_notification_record(
                                request["user_id"],
                                role,
                                title,
                                message,
                                crop_data["id"],
                                request["id"]
                            )

                        except Exception as e:

                            print(f"Error creating notification record: {e}")

                        try:

                            user = get_user_by_role(
                                request["user_id"],
                                role
                            )

                            if user and user.get("email"):

                                send_notification_email(
                                    user["email"],
                                    title,
                                    message
                                )

                        except Exception as e:

                            print(f"Error sending email: {e}")

                        matched.append({
                            "crop_id": crop_data["id"],
                            "request_id": request["id"],
                            "user_id": request["user_id"],
                            "user_role": role,
                            "match_score": match_score
                        })

            except Exception as e:

                print(f"Error processing {table}: {e}")

        return matched

    except Exception as e:

        print(f"Error in notify_matching_requests: {e}")

        return []


# ==========================================
# PENDING CROP VERIFICATIONS
# ==========================================

@pfo_bp.route(
    "/api/pfo/pending-crops/<district>",
    methods=["GET"]
)
def pending_crop_verifications(district):

    try:

        response = supabase.table(
            "crops"
        ).select("*").eq(
            "district",
            district
        ).eq(
            "verification_status",
            "pending"
        ).execute()

        crop_images_response = supabase.table(
            "crop_images"
        ).select("*").execute()

        crop_qr_response = supabase.table(
            "crop_qr"
        ).select("*").execute()

        # ==================================
        # JOIN IMAGE URLs & QR CODES WITH CROPS
        # ==================================
        
        image_map = {
            str(img.get("crop_id")): img.get("image_url", "") 
            for img in (crop_images_response.data or [])
        }
        
        qr_map = {
            str(qr.get("crop_id")): qr 
            for qr in (crop_qr_response.data or [])
        }
        
        for crop in (response.data or []):
            c_id_str = str(crop.get("id"))
            crop["image_url"] = crop.get("image_url") or image_map.get(c_id_str, "")
            qr_item = qr_map.get(c_id_str, {})
            crop["qr_base64"] = qr_item.get("qr_base64")
            crop["qr_traceability_id"] = crop.get("qr_traceability_id") or qr_item.get("qr_traceability_id") or f"KM-TRC-{c_id_str[:8].upper()}"

        return jsonify({

            "success": True,

            "crops": response.data

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "message": str(e)

        }), 500

# ==========================================
# VERIFY CROP
# ==========================================
# ==========================================
# VERIFY CROP
# ==========================================

@pfo_bp.route(
    "/api/pfo/verify-crop",
    methods=["POST"]
)
def verify_crop():

    try:

        data = request.get_json()

        print("VERIFY CROP DATA:", data)

        crop_id = data.get("crop_id")

        verification_status = data.get(
            "verification_status"
        )

        quality_grade = data.get(
            "quality_grade"
        )

        remarks = data.get(
            "remarks"
        )

        rejection_reason = data.get(
            "rejection_reason"
        )

        verified_by = data.get(
            "verified_by"
        )

        verified_district = data.get(
            "verified_district"
        )

        print("CROP ID:", crop_id, "STATUS:", verification_status)

        # ==================================
        # FETCH CROP
        # ==================================

        crop_response = supabase.table(
            "crops"
        ).select("*").eq(
            "id",
            crop_id
        ).execute()

        if not crop_response.data:

            return jsonify({

                "success": False,

                "message": "Crop not found"

            }), 404

        crop_data = crop_response.data[0]

        print("CROP DATA:", crop_data)

        # ==================================
        # UPDATE CROP
        # ==================================

        supabase.table(
            "crops"
        ).update({

            "verification_status":
                verification_status,

            "quality_grade":
                quality_grade,

            "pfo_remarks":
                remarks,

            "rejection_reason":
                rejection_reason,

            "verified_by":
                verified_by,

            "verified_district":
                verified_district,

            "verified_at":
                datetime.now().isoformat()

        }).eq(
            "id",
            crop_id
        ).execute()

        auction = None

        if verification_status == "verified":

            print("CREATING AUCTION FOR CROP:", crop_id)

            try:

                auction = get_or_create_auction(crop_id)

                print("AUCTION CREATED:", auction)

            except Exception as e:

                print(f"Error creating auction: {e}")

                auction = None

        log_traceability_event(
            crop_id=crop_id,
            traceability_id=crop_data.get("qr_traceability_id"),
            performed_by=verified_by or "PFO Officer",
            role="PFO",
            action="Crop Verified" if verification_status == "verified" else "Crop Rejected",
            price=crop_data.get("expected_price"),
            location=f"{verified_district or crop_data.get('district')}, Karnataka",
            remarks=f"Grade: {quality_grade}. Remarks: {remarks or ''}",
            status="Verified" if verification_status == "verified" else "Rejected"
        )

        if verification_status == "verified":
            log_traceability_event(
                crop_id=crop_id,
                traceability_id=crop_data.get("qr_traceability_id"),
                performed_by="System Automated Engine",
                role="System",
                action="Auction Started",
                price=crop_data.get("expected_price"),
                location=f"{crop_data.get('district')}, Karnataka",
                remarks=f"Live bidding started with base price ₹{crop_data.get('expected_price')}",
                status="Auction Active"
            )

        # ==================================
        # QR CONTENT
        # ==================================

        qr_data = f"""
Crop Name:
{crop_data.get('crop_name', '')}

Category:
{crop_data.get('crop_category', '')}

Quantity:
{crop_data.get('quantity', '')}
{crop_data.get('unit', '')}

District:
{crop_data.get('district', '')}

Harvest Date:
{crop_data.get('harvest_date', '')}

Verification Status:
{verification_status}

Quality Grade:
{quality_grade}

Verified By:
{verified_by}

Verified District:
{verified_district}

Traceability ID:
{crop_data.get('qr_traceability_id', '')}
"""

        print("QR DATA:", qr_data)

        # ==================================
        # GENERATE QR
        # ==================================

        qr = qrcode.make(qr_data)

        buffer = io.BytesIO()

        qr.save(buffer)

        qr_base64 = base64.b64encode(

            buffer.getvalue()

        ).decode()

        print("QR GENERATED, LENGTH:", len(qr_base64))

        # ==================================
        # CHECK QR EXISTS
        # ==================================

        existing_qr = supabase.table(
            "crop_qr"
        ).select("*").eq(
            "crop_id",
            crop_id
        ).execute()

        # UPDATE
        if existing_qr.data:

            supabase.table(
                "crop_qr"
            ).update({

                "qr_base64":
                    qr_base64

            }).eq(
                "crop_id",
                crop_id
            ).execute()

        # INSERT
        else:

            supabase.table(
                "crop_qr"
            ).insert({

                "crop_id":
                    crop_id,

                "qr_traceability_id":
                    crop_data.get(
                        "qr_traceability_id",
                        ""
                    ),

                "qr_base64":
                    qr_base64

            }).execute()

        # ==================================
        # SAVE VERIFICATION LOG
        # ==================================

        supabase.table(
            "crop_verifications"
        ).insert({

            "crop_id":
                crop_id,

            "farmer_id":
                crop_data.get(
                    "farmer_id"
                ),

            "verification_status":
                verification_status,

            "quality_grade":
                quality_grade,

            "remarks":
                remarks,

            "rejection_reason":
                rejection_reason,

            "verified_by":
                verified_by,

            "verified_district":
                verified_district,

            "verified_at":
                datetime.now().isoformat()

        }).execute()

        # ==================================
        # SAVE NOTIFICATION
        # ==================================

        message = ""

        if verification_status == "verified":

            auction_end = (
                auction.get("auction_end")
                if auction else ""
            )

            message = (
                "Your crop has been verified successfully and is now live for bidding."
            )

            print("NOTIFYING MATCHING REQUESTS")

            notify_matching_requests(
                crop_data,
                auction_end
            )

        else:

            message = (
                f"Your crop was rejected. Reason: {rejection_reason}"
            )

        print("NOTIFICATION MESSAGE:", message)

        supabase.table(
            "crop_notifications"
        ).insert({

            "crop_id":
                crop_id,

            "farmer_id":
                crop_data.get(
                    "farmer_id"
                ),

            "title":
                "Crop Verification Update",

            "message":
                message,

            "notification_type":
                verification_status

        }).execute()

        return jsonify({

            "success": True,

            "message":
                "Crop verification completed"

        })

    except Exception as e:

        print(
            "VERIFY CROP ERROR:",
            str(e)
        )

        return jsonify({

            "success": False,

            "message": str(e)

        }), 500
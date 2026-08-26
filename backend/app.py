from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client
from dotenv import load_dotenv
from flask_mail import Mail, Message
import os
import uuid
from cryptography.fernet import Fernet
import random
import datetime
from farmer import farmer_bp
from pfo import pfo_bp
from difflib import SequenceMatcher
from datetime import datetime, timedelta
from payment import payment_bp
from traceability import traceability_bp, log_traceability_event

load_dotenv()

app = Flask(__name__)
CORS(app)
app.register_blueprint(farmer_bp)
app.register_blueprint(pfo_bp)
app.register_blueprint(payment_bp)
app.register_blueprint(traceability_bp)
# ==========================================
# SUPABASE CONFIG
# ==========================================

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ==========================================
# TRANSACTION HISTORY ROUTES
# ==========================================

@app.route("/api/farmer/transaction-history/<int:farmer_id>", methods=["GET"])
def get_farmer_transaction_history(farmer_id):
    try:
        response = supabase.table("completed_auction_results").select("*").eq("farmer_id", farmer_id).order("winning_timestamp", desc=True).execute()
        return jsonify(response.data or [])
    except Exception as e:
        print("FARMER HISTORY ERROR:", e)
        return jsonify([]), 500

@app.route("/api/pfo/transaction-history/<district>", methods=["GET"])
def get_pfo_transaction_history(district):
    try:
        response = supabase.table("completed_auction_results").select("*").eq("pfo_district", district).order("winning_timestamp", desc=True).execute()
        return jsonify(response.data or [])
    except Exception as e:
        print("PFO HISTORY ERROR:", e)
        return jsonify([]), 500


# ==========================================
# TEXT NORMALIZATION
# ==========================================

def normalize_crop_name(text):

    return text.lower().strip()


# ==========================================
# FUZZY MATCH
# ==========================================

def similarity(a, b):

    return SequenceMatcher(

        None,

        normalize_crop_name(a),

        normalize_crop_name(b)

    ).ratio()


# ==========================================
# ENCRYPTION SETUP
# ==========================================

cipher = Fernet(
    os.getenv("ENCRYPTION_KEY").encode()
)

# Encrypt Data
def encrypt_data(data):

    return cipher.encrypt(
        data.encode()
    ).decode()

# Decrypt Data
def decrypt_data(data):

    return cipher.decrypt(
        data.encode()
    ).decode()

# ==========================================
# SEND VERIFICATION MAIL
# ==========================================

def send_verification_mail(
    email,
    username
):

    try:

        msg = Message(

            subject="KrishiMitra Account Verified",

            sender=app.config['MAIL_USERNAME'],

            recipients=[email]
        )

        msg.body = f"""
Your KrishiMitra account has been verified successfully.

You can now log in using your credentials.

Username: {username}

Thank you,
KrishiMitra Team
"""

        mail.send(msg)

    except Exception as e:

        print("MAIL ERROR:", e)



# ==========================================
# MAIL CONFIG
# ==========================================

app.config['MAIL_SERVER'] = os.getenv("MAIL_SERVER")
app.config['MAIL_PORT'] = int(os.getenv("MAIL_PORT"))
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME")
app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD")

mail = Mail(app)



# ==========================================
# OTP STORAGE
# ==========================================

otp_storage = {}

# Temporary store for registration data until OTP verification
pending_registrations = {}
# ==========================================
# GENERATE OTP
# ==========================================

def generate_otp():

    return str(
        random.randint(1000, 9999)
    )

# ==========================================
# SEND OTP MAIL
# ==========================================

def send_otp_mail(email, otp):

    try:

        msg = Message(

            subject="KrishiMitra Email Verification",

            sender=app.config['MAIL_USERNAME'],

            recipients=[email]
        )

        msg.body = f"""
Your KrishiMitra OTP Verification Code is:

{otp}

This OTP is valid for 5 minutes.
"""

        mail.send(msg)

    except Exception as e:

        print("OTP MAIL ERROR:", e)

# ==========================================
# SEND SUCCESS MAIL
# ==========================================

def send_registration_success_mail(
    email,
    username
):

    try:

        msg = Message(

            subject="KrishiMitra Registration Successful",

            sender=app.config['MAIL_USERNAME'],

            recipients=[email]
        )

        msg.body = f"""
Welcome to KrishiMitra

Your account has been created successfully.

Username: {username}

You can now login using your credentials.

Thank You,
KrishiMitra Team
"""

        mail.send(msg)

    except Exception as e:

        print("SUCCESS MAIL ERROR:", e)


# ==========================================
# BACKEND HELPERS
# ==========================================

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


def create_notification_record(
    user_id,
    user_role,
    title,
    message,
    crop_id=None,
    request_id=None
):

    try:
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
        print(f"DEBUG: Failed to create notification record: {str(e)}")
        # Continue without failing the whole operation


def send_notification_mail(email, subject, message):

    try:

        msg = Message(

            subject=subject,

            sender=app.config[
                'MAIL_USERNAME'
            ],

            recipients=[email]
        )

        msg.body = message

        mail.send(msg)

    except Exception as e:

        print("NOTIFICATION MAIL ERROR:", e)


def get_or_create_auction(crop_id):

    response = supabase.table(
        "crop_auctions"
    ).select("*").eq(
        "crop_id",
        crop_id
    ).execute()

    if response.data:

        return response.data[0]

    start = datetime.now()

    end = (
        start + timedelta(days=2)
    ).isoformat()

    supabase.table(
        "crop_auctions"
    ).insert({

        "crop_id":
            crop_id,

        "auction_start":
            start.isoformat(),

        "auction_end":
            end,

        "auction_status":
            "active",

        "closed_by_pfo":
            False,

        "created_at":
            start.isoformat()

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


def close_auction_if_expired(crop_id):

    response = supabase.table(
        "crop_auctions"
    ).select("*").eq(
        "crop_id",
        crop_id
    ).execute()

    if not response.data:

        return None

    auction = response.data[0]

    if auction.get("auction_status") != "active":

        return auction

    end = datetime.fromisoformat(
        auction["auction_end"]
    )

    if datetime.now() >= end:

        supabase.table(
            "crop_auctions"
        ).update({

            "auction_status":
                "closed"

        }).eq(
            "crop_id",
            crop_id
        ).execute()

        auction["auction_status"] = "closed"

    return auction


def notify_matching_requests(
    crop_data,
    auction_end
):

    matched = []

    for table, role in [
        ("dealer_crop_requests", "dealer"),
        ("retailer_crop_requests", "retailer")
    ]:

        requests_response = supabase.table(
            table
        ).select("*").execute()

        for request in requests_response.data or []:

            score = similarity(
                request["crop_type"],
                crop_data["crop_name"]
            )

            if score >= 0.65:

                match_score = round(
                    score * 100,
                    2
                )

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

                user = get_user_by_role(
                    request["user_id"],
                    role
                )

                if user:

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

                    create_notification_record(
                        request["user_id"],
                        role,
                        title,
                        message,
                        crop_data["id"],
                        request["id"]
                    )

                    if user.get("email"):

                        send_notification_mail(
                            user["email"],
                            title,
                            message
                        )

                    matched.append(
                        {
                            "crop_id":
                                crop_data["id"],

                            "user_id":
                                request["user_id"],

                            "user_role":
                                role,

                            "match_score":
                                match_score
                        }
                    )

    return matched


# ==========================================
# ADMIN LOGIN
# ==========================================

ADMIN_USERNAME = "krishimitra"
ADMIN_PASSWORD = "krishimitra@project"

@app.route("/api/admin/login", methods=["POST"])
def admin_login():

    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:

        return jsonify({
            "success": True,
            "message": "Admin Login Successful"
        })

    return jsonify({
        "success": False,
        "message": "Invalid Credentials"
    }), 401

# ==========================================
# CREATE PFO
# ==========================================

# ==========================================
# CREATE PFO
# ==========================================

@app.route("/api/pfo/create", methods=["POST"])
def create_pfo():

    data = request.get_json()

    pfo_name = data.get("pfo_name")

    username = data.get("username")

    password = data.get("password")

    email = data.get("email")

    phone = data.get("phone")

    district = data.get("district")

    # Insert into Supabase
    response = supabase.table("pfo_accounts").insert({

        "pfo_name": pfo_name,
        "username": username,
        "password": password,
        "email": email,
        "phone": phone,
        "district": district

    }).execute()

    # Send Email
    try:

        msg = Message(

            subject="KrishiMitra PFO Account Created",

            sender=app.config['MAIL_USERNAME'],

            recipients=[email]
        )

        msg.body = f"""
Welcome to KrishiMitra

Your PFO account has been created successfully.

Username: {username}

Temporary Password: {password}

Assigned District: {district}

Login Instructions:
Use the above credentials to login.

Please change your password after first login.
"""

        mail.send(msg)

    except Exception as e:

        print("Email Error:", e)

    return jsonify({

        "success": True,
        "message": "PFO Created Successfully"

    })

# ==========================================
# GET ALL PFOs
# ==========================================

@app.route("/api/pfo/all", methods=["GET"])
def get_all_pfos():

    response = supabase.table("pfo_accounts").select("*").execute()

    return jsonify(response.data)

# ==========================================
# DELETE PFO
# ==========================================

@app.route("/api/pfo/delete/<int:pfo_id>", methods=["DELETE"])
def delete_pfo(pfo_id):

    supabase.table("pfo_accounts").delete().eq("id", pfo_id).execute()

    return jsonify({
        "success": True,
        "message": "PFO Deleted Successfully"
    })



# ==========================================
# PFO LOGIN
# ==========================================

@app.route("/api/pfo/login", methods=["POST"])
def pfo_login():

    data = request.get_json()

    username = data.get("username")

    password = data.get("password")

    response = supabase.table("pfo_accounts") \
        .select("*") \
        .eq("username", username) \
        .eq("password", password) \
        .execute()

    if len(response.data) > 0:

        return jsonify({
            "success": True,
            "message": "PFO Login Successful",
            "user": response.data[0]
        })

    return jsonify({
        "success": False,
        "message": "Invalid Credentials"
    }), 401



# ==========================================
# FARMER / DEALER REGISTRATION
# ==========================================

# ==========================================
# FARMER / DEALER REGISTRATION
# ==========================================

@app.route("/api/register", methods=["POST"])
def register_user():

    try:

        data = request.get_json()

        role = data.get("role")
        full_name = data.get("full_name")
        username = data.get("username")
        age = data.get("age")
        district = data.get("district")
        aadhaar = data.get("aadhaar")
        email = data.get("email")
        password = data.get("password")

        # Encrypt Aadhaar
        aadhaar_encrypted = encrypt_data(aadhaar)

        # Find Assigned PFO
        pfo = supabase.table(
            "pfo_accounts"
        ).select("*").eq(
            "district",
            district
        ).execute()

        assigned_pfo_id = None

        if len(pfo.data) > 0:

            assigned_pfo_id = pfo.data[0]["id"]

        # For Farmer/Dealer, do not insert into DB yet.
        # Save registration data temporarily and send OTP to the provided email.
        # Check if username or email already exists in farmers or dealers
        existing_f_user = supabase.table("farmers").select("*").eq("username", username).execute()
        existing_f_email = supabase.table("farmers").select("*").eq("email", email).execute()
        existing_d_user = supabase.table("dealers").select("*").eq("username", username).execute()
        existing_d_email = supabase.table("dealers").select("*").eq("email", email).execute()

        if (existing_f_user.data and len(existing_f_user.data) > 0) or (existing_f_email.data and len(existing_f_email.data) > 0) or (existing_d_user.data and len(existing_d_user.data) > 0) or (existing_d_email.data and len(existing_d_email.data) > 0):
            return jsonify({"success": False, "message": "Username or email already exists"}), 400

        pending_registrations[email] = {
            "role": role,
            "full_name": full_name,
            "username": username,
            "age": age,
            "district": district,
            "aadhaar": aadhaar,
            "email": email,
            "password": password,
            "extra": {}
        }

        if role == "farmer":
            pending_registrations[email]["extra"]["acres"] = data.get("acres")
        else:
            pending_registrations[email]["extra"]["institution"] = data.get("institution")

        # Generate OTP and store
        otp = generate_otp()
        expiry = datetime.now() + timedelta(minutes=5)
        otp_storage[email] = {"otp": otp, "expiry": expiry}

        # Send OTP mail
        send_otp_mail(email, otp)

        return jsonify({"success": True, "message": "OTP Sent. Verify to complete registration"})

    except Exception as e:

        print("REGISTER ERROR:", e)

        return jsonify({

            "success": False,

            "message":
                str(e)

        }), 500

# ==========================================
# GET PENDING REQUESTS
# ==========================================

@app.route(
    "/api/pfo/pending/<district>",
    methods=["GET"]
)
def get_pending_requests(district):

    farmers = supabase.table("farmers") \
        .select("*") \
        .eq("district", district) \
        .eq(
            "verification_status",
            "pending_verification"
        ) \
        .execute()

    dealers = supabase.table("dealers") \
        .select("*") \
        .eq("district", district) \
        .eq(
            "verification_status",
            "pending_verification"
        ) \
        .execute()

    return jsonify({

        "farmers": farmers.data,
        "dealers": dealers.data

    })


# ==========================================
# APPROVE USER
# ==========================================

@app.route(
    "/api/pfo/approve",
    methods=["POST"]
)
def approve_user():

    data = request.get_json()

    role = data.get("role")

    user_id = data.get("user_id")

    pfo_id = data.get("pfo_id")

    table = (
    "farmers"
    if role == "farmer"
    else "dealers"
)
    response = supabase.table(table) \
        .update({

            "verification_status":
                "approved"

        }) \
        .eq("id", user_id) \
        .execute()

    user = response.data[0]

    # Save verification history
    supabase.table(
        "verification_status"
    ).insert({

        "user_id": user_id,
        "role": role,
        "verified_by_pfo": pfo_id,
        "status": "approved"

    }).execute()

    # Send Mail
    send_verification_mail(

        user["email"],
        user["username"]

    )

    return jsonify({

        "success": True,
        "message": "User Approved"

    })


@app.route(
    "/api/pfo/reject",
    methods=["POST"]
)
def reject_user():

    data = request.get_json()

    role = data.get("role")

    user_id = data.get("user_id")

    table = (
    "farmers"
    if role == "farmer"
    else "dealers"
)

    supabase.table(table) \
        .update({

            "verification_status":
                "rejected"

        }) \
        .eq("id", user_id) \
        .execute()

    return jsonify({

        "success": True,
        "message": "User Rejected"

    })

# ==========================================
# FARMER / DEALER LOGIN
# ==========================================




# ==========================================
# FARMER / DEALER LOGIN
# ==========================================

@app.route("/api/user/login", methods=["POST"])
def user_login():

    data = request.get_json()

    role = data.get("role")

    username = data.get("username")

    password = data.get("password")

    table = (
    "farmers"
    if role == "farmer"
    else "dealers"
)

    print(f"DEBUG: Login attempt role={role} username={username}")

    response = supabase.table(table).select("*").eq("username", username).eq("password", password).execute()

    if len(response.data) > 0:
        user = response.data[0]

        # Enforce verification status for farmer/dealer accounts
        verification_status = user.get("verification_status")

        if verification_status == "pending_verification":
            return jsonify({"success": False, "message": "Your account is pending verification by the Administrator/PFO. Please wait until your account is approved."}), 403

        if verification_status == "rejected":
            return jsonify({"success": False, "message": "Your account has been rejected. Please contact the administrator for further assistance."}), 403

        if verification_status == "approved":
            return jsonify({"success": True, "message": "You have successfully logged in", "user": user})

        # If verification_status not present (unexpected), deny login for safety
        return jsonify({"success": False, "message": "Account not verified or invalid credentials"}), 401

    return jsonify({"success": False, "message": "Account not verified or invalid credentials"}), 401

    # No matching user found: check if there is a pending registration for this username/email
    # This helps return a clearer message when OTP verification hasn't completed yet.
    pending_match = None
    for email, reg in pending_registrations.items():
        if reg.get("username") == username or reg.get("email") == username:
            pending_match = reg
            break

    if pending_match:
        return jsonify({"success": False, "message": "OTP not verified. Please check your email and verify the OTP to complete registration."}), 401

    return jsonify({"success": False, "message": "Account not verified or invalid credentials"}), 401


# ==========================================
# SEND OTP
# ==========================================

@app.route("/api/send-otp", methods=["POST"])
def send_otp():

    data = request.get_json()

    email = data.get("email")

    otp = generate_otp()

    expiry = datetime.now() + \
        timedelta(minutes=5)

    otp_storage[email] = {

        "otp": otp,

        "expiry": expiry
    }

    send_otp_mail(email, otp)

    return jsonify({

        "success": True,

        "message": "OTP Sent Successfully"

    })

# ==========================================
# VERIFY OTP & REGISTER
# ==========================================

@app.route("/api/verify-otp-register", methods=["POST"])
def verify_otp_register():

    try:

        data = request.get_json()

        role = data.get("role")

        full_name = data.get("full_name")

        username = data.get("username")

        district = data.get("district")

        email = data.get("email")

        password = data.get("password")

        entered_otp = data.get("otp")

        # Check OTP Exists
        if email not in otp_storage:

            return jsonify({

                "success": False,

                "message": "OTP Expired"

            }), 400

        saved_otp = otp_storage[email]["otp"]

        expiry = otp_storage[email]["expiry"]

        # Expiry Check
        if datetime.now() > expiry:

            del otp_storage[email]

            return jsonify({

                "success": False,

                "message": "OTP Expired"

            }), 400

        # OTP Match
        if entered_otp != saved_otp:

            return jsonify({

                "success": False,

                "message": "Invalid OTP"

            }), 400

        # Handle retailer/customer (immediate active accounts)
        if role == "retailer":
            supabase.table("retailers").insert({
                "full_name": full_name,
                "username": username,
                "district": district,
                "email": email,
                "password": password,
                "role": "retailer",
                "status": "active"
            }).execute()

        elif role == "customer":
            supabase.table("customers").insert({
                "full_name": full_name,
                "username": username,
                "district": district,
                "email": email,
                "password": password,
                "role": "customer",
                "status": "active"
            }).execute()

        # Handle farmer/dealer: insert only after OTP verification and mark pending_verification
        elif role in ("farmer", "dealer"):

            # Prefer data from pending_registrations if available
            pending = pending_registrations.get(email, None)

            if pending:
                reg = pending
            else:
                # Fallback to request payload
                reg = {
                    "role": role,
                    "full_name": full_name,
                    "username": username,
                    "age": data.get("age"),
                    "district": district,
                    "aadhaar": data.get("aadhaar"),
                    "email": email,
                    "password": password,
                    "extra": {"acres": data.get("acres"), "institution": data.get("institution")}
                }

            # Encrypt aadhaar
            aadhaar_encrypted = encrypt_data(reg.get("aadhaar") or "")

            # Find Assigned PFO
            pfo = supabase.table("pfo_accounts").select("*").eq("district", reg.get("district")).execute()

            assigned_pfo_id = None
            if len(pfo.data) > 0:
                assigned_pfo_id = pfo.data[0]["id"]

            if reg.get("role") == "farmer":
                acres = reg.get("extra", {}).get("acres")
                encrypted_land = encrypt_data(str(acres) if acres is not None else "")

                response = supabase.table("farmers").insert({
                    "full_name": reg.get("full_name"),
                    "username": reg.get("username"),
                    "age": reg.get("age"),
                    "district": reg.get("district"),
                    "aadhaar_encrypted": aadhaar_encrypted,
                    "email": reg.get("email"),
                    "password": reg.get("password"),
                    "land_details_encrypted": encrypted_land,
                    "assigned_pfo_id": assigned_pfo_id,
                    "verification_status": "pending_verification",
                    "role": "farmer"
                }).execute()

            else:
                institution = reg.get("extra", {}).get("institution")
                encrypted_institution = encrypt_data(institution or "")

                response = supabase.table("dealers").insert({
                    "full_name": reg.get("full_name"),
                    "username": reg.get("username"),
                    "age": reg.get("age"),
                    "district": reg.get("district"),
                    "aadhaar_encrypted": aadhaar_encrypted,
                    "email": reg.get("email"),
                    "password": reg.get("password"),
                    "institution_encrypted": encrypted_institution,
                    "assigned_pfo_id": assigned_pfo_id,
                    "verification_status": "pending_verification",
                    "role": "dealer"
                }).execute()

            # Get inserted ID and notify PFO
            applicant_id = response.data[0]["id"] if response.data else None

            supabase.table("pfo_notifications").insert({
                "pfo_id": assigned_pfo_id,
                "applicant_id": applicant_id,
                "applicant_role": role,
                "district": reg.get("district")
            }).execute()

            # Remove pending registration if present
            if email in pending_registrations:
                del pending_registrations[email]

        # Remove OTP
        if email in otp_storage:
            del otp_storage[email]

        # Success Mail
        send_registration_success_mail(email, username)

        return jsonify({"success": True, "message": "Registration Successful"})

    except Exception as e:

        print("OTP REGISTER ERROR:", e)

        return jsonify({

            "success": False,

            "message": str(e)

        }), 500

# ==========================================
# RETAILER / CUSTOMER LOGIN
# ==========================================

@app.route("/api/retail-login", methods=["POST"])
def retail_login():

    data = request.get_json()

    role = data.get("role")

    username = data.get("username")

    password = data.get("password")

    table = (
        "retailers"
        if role == "retailer"
        else "customers"
    )

    response = supabase.table(table) \
        .select("*") \
        .eq("username", username) \
        .eq("password", password) \
        .execute()

    if len(response.data) > 0:

        return jsonify({

            "success": True,

            "message":
                "You have successfully logged in",

            "user": response.data[0]

        })

    return jsonify({

        "success": False,

        "message":
            "Invalid Credentials"

    }), 401



# ==========================================
# DEALER ADD REQUEST
# ==========================================

@app.route(
    "/api/dealer/add-request",
    methods=["POST"]
)
def add_dealer_request():

    try:

        data = request.get_json()

        response = supabase.table(
            "dealer_crop_requests"
        ).insert({

            "user_id":
                data.get("user_id"),

            "crop_type":
                data.get("crop_type"),

            "crop_category":
                data.get("crop_category"),

            "quantity":
                data.get("quantity"),

            "unit":
                data.get("unit"),

            "delivery_date":
                data.get("delivery_date"),

            "notes":
                data.get("notes")

        }).execute()

        return jsonify({

            "success": True,

            "message":
                "Request Added Successfully",

            "data":
                response.data

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "message": str(e)

        }), 500


# ==========================================
# GET DEALER REQUESTS
# ==========================================

@app.route(
    "/api/dealer/requests/<int:user_id>",
    methods=["GET"]
)
def get_dealer_requests(user_id):

    try:

        response = supabase.table(
            "dealer_crop_requests"
        ).select("*").eq(
            "user_id",
            user_id
        ).order(
            "id",
            desc=True
        ).execute()

        return jsonify({

            "success": True,

            "requests":
                response.data

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "message": str(e)

        }), 500


# ==========================================
# UPDATE DEALER REQUEST
# ==========================================

@app.route(
    "/api/dealer/update-request/<int:request_id>",
    methods=["PUT"]
)
def update_dealer_request(request_id):

    try:

        data = request.get_json()

        supabase.table(
            "dealer_crop_requests"
        ).update({

            "crop_type":
                data.get("crop_type"),

            "crop_category":
                data.get("crop_category"),

            "quantity":
                data.get("quantity"),

            "unit":
                data.get("unit"),

            "delivery_date":
                data.get("delivery_date"),

            "notes":
                data.get("notes")

        }).eq(
            "id",
            request_id
        ).execute()

        return jsonify({

            "success": True,

            "message":
                "Request Updated Successfully"

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "message": str(e)

        }), 500


# ==========================================
# DELETE DEALER REQUEST
# ==========================================

@app.route(
    "/api/dealer/delete-request/<int:request_id>",
    methods=["DELETE"]
)
def delete_dealer_request(request_id):

    try:

        supabase.table(
            "dealer_crop_requests"
        ).delete().eq(
            "id",
            request_id
        ).execute()

        return jsonify({

            "success": True,

            "message":
                "Request Deleted Successfully"

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "message": str(e)

        }), 500


# ==========================================
# RETAILER ADD REQUEST
# ==========================================

@app.route(
    "/api/retailer/add-request",
    methods=["POST"]
)
def add_retailer_request():

    try:

        data = request.get_json()

        response = supabase.table(
            "retailer_crop_requests"
        ).insert({

            "user_id":
                data.get("user_id"),

            "crop_type":
                data.get("crop_type"),

            "crop_category":
                data.get("crop_category"),

            "quantity":
                data.get("quantity"),

            "unit":
                data.get("unit"),

            "delivery_date":
                data.get("delivery_date"),

            "notes":
                data.get("notes")

        }).execute()

        return jsonify({

            "success": True,

            "message":
                "Request Added Successfully",

            "data":
                response.data

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "message": str(e)

        }), 500


# ==========================================
# GET RETAILER REQUESTS
# ==========================================

@app.route(
    "/api/retailer/requests/<int:user_id>",
    methods=["GET"]
)
def get_retailer_requests(user_id):

    try:

        response = supabase.table(
            "retailer_crop_requests"
        ).select("*").eq(
            "user_id",
            user_id
        ).order(
            "id",
            desc=True
        ).execute()

        return jsonify({

            "success": True,

            "requests":
                response.data

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "message": str(e)

        }), 500


# ==========================================
# UPDATE RETAILER REQUEST
# ==========================================

@app.route(
    "/api/retailer/update-request/<int:request_id>",
    methods=["PUT"]
)
def update_retailer_request(request_id):

    try:

        data = request.get_json()

        supabase.table(
            "retailer_crop_requests"
        ).update({

            "crop_type":
                data.get("crop_type"),

            "crop_category":
                data.get("crop_category"),

            "quantity":
                data.get("quantity"),

            "unit":
                data.get("unit"),

            "delivery_date":
                data.get("delivery_date"),

            "notes":
                data.get("notes")

        }).eq(
            "id",
            request_id
        ).execute()

        return jsonify({

            "success": True,

            "message":
                "Request Updated Successfully"

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "message": str(e)

        }), 500


# ==========================================
# DELETE RETAILER REQUEST
# ==========================================

@app.route(
    "/api/retailer/delete-request/<int:request_id>",
    methods=["DELETE"]
)
def delete_retailer_request(request_id):

    try:

        supabase.table(
            "retailer_crop_requests"
        ).delete().eq(
            "id",
            request_id
        ).execute()

        return jsonify({

            "success": True,

            "message":
                "Request Deleted Successfully"

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "message": str(e)

        }), 500
    
# ==========================================
# VERIFIED MARKETPLACE
# ==========================================

@app.route(
    "/api/marketplace",
    methods=["GET"]
)
def marketplace():

    try:

        crops_response = supabase.table(
            "crops"
        ).select("*").eq(
            "verification_status",
            "verified"
        ).execute()

        image_response = supabase.table(
            "crop_images"
        ).select("*").execute()

        auction_response = supabase.table(
            "crop_auctions"
        ).select("*").execute()

        image_map = {
            img["crop_id"]: img["image_url"]
            for img in image_response.data or []
        }

        auction_map = {
            auction["crop_id"]: auction
            for auction in auction_response.data or []
        }

        crops = []

        for crop in crops_response.data or []:

            crop["image_url"] = image_map.get(
                crop["id"],
                ""
            )

            auction = auction_map.get(
                crop["id"]
            )

            if auction:

                crop["auction_end"] = (
                    auction.get("auction_end")
                )

                crop["auction_status"] = (
                    auction.get("auction_status")
                    or "active"
                )

                crop["auction_start"] = (
                    auction.get("auction_start")
                )

                crop["winning_bid_id"] = (
                    # auction.get("winning_bid_id")
                    None
                )

                crop["closed_by_pfo"] = (
                    auction.get("closed_by_pfo")
                )

            else:

                crop["auction_status"] = "pending"

            crops.append(crop)

        return jsonify({

            "success": True,

            "crops": crops

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "message": str(e)

        }), 500
    

# ==========================================
# PLACE BID
# ==========================================

@app.route(
    "/api/bid/place",
    methods=["POST"]
)
def place_bid():

    try:

        data = request.get_json()

        crop_id = data.get("crop_id")

        bidder_id = data.get("bidder_id")

        bidder_role = data.get("bidder_role")

        bid_amount = data.get("bid_amount")

        if bid_amount is None:

            return jsonify({

                "success": False,

                "message":
                    "Bid amount is required"

            }), 400

        bid_amount = float(bid_amount)

        if bid_amount <= 0:

            return jsonify({

                "success": False,

                "message":
                    "Bid must be a positive number"

            }), 400

        # ==================================
        # FETCH CROP
        # ==================================

        crop = supabase.table(
            "crops"
        ).select("*").eq(
            "id",
            crop_id
        ).execute()

        if not crop.data:

            return jsonify({

                "success": False,

                "message":
                    "Crop not found"

            }), 404

        crop_data = crop.data[0]

        if crop_data.get(
            "verification_status"
        ) != "verified":

            return jsonify({

                "success": False,

                "message":
                    "Only verified crops may be bid on"

            }), 400

        base_price_str = crop_data["expected_price"]

        # Parse base price (e.g., "20/kg" -> 20.0)
        if "/" in base_price_str:
            base_price = float(base_price_str.split("/")[0])
        else:
            base_price = float(base_price_str)

        if bid_amount <= base_price:

            return jsonify({

                "success": False,

                "message":
                    "Bid must be above base price"

            }), 400

        auction_response = supabase.table(
            "crop_auctions"
        ).select("*").eq(
            "crop_id",
            crop_id
        ).execute()

        if not auction_response.data:

            return jsonify({

                "success": False,

                "message":
                    "Auction is not active for this crop"

            }), 400

        auction = auction_response.data[0]

        if auction.get("auction_status") == "closed":

            return jsonify({

                "success": False,

                "message":
                    "Auction has already been closed"

            }), 400

        if datetime.now() >= datetime.fromisoformat(
            auction["auction_end"]
        ):

            supabase.table(
                "crop_auctions"
            ).update({

                "auction_status":
                    "closed"

            }).eq(
                "crop_id",
                crop_id
            ).execute()

            return jsonify({

                "success": False,

                "message":
                    "Auction has ended"

            }), 400

        # ==================================
        # CHECK EXISTING BID
        # ==================================

        existing = supabase.table(
            "crop_bids"
        ).select("*").eq(
            "crop_id",
            crop_id
        ).eq(
            "bidder_id",
            bidder_id
        ).execute()

        action_type = "placed"

        if existing.data:

            bid_id = existing.data[0]["id"]

            supabase.table(
                "crop_bids"
            ).update({

                "bid_amount":
                    bid_amount,

                "bid_status":
                    "active",

                "updated_at":
                    datetime.now().isoformat()

            }).eq(
                "id",
                bid_id
            ).execute()

            action_type = "updated"

        else:

            supabase.table(
                "crop_bids"
            ).insert({

                "crop_id":
                    crop_id,

                "bidder_id":
                    bidder_id,

                "bidder_role":
                    bidder_role,

                "bid_amount":
                    bid_amount,

                "bid_status":
                    "active",

                "created_at":
                    datetime.now().isoformat(),

                "updated_at":
                    datetime.now().isoformat()

            }).execute()

        # ==================================
        # BID HISTORY
        # ==================================

        supabase.table(
            "bid_history"
        ).insert({

            "crop_id":
                crop_id,

            "bidder_id":
                bidder_id,

            "bidder_role":
                bidder_role,

            "bid_amount":
                bid_amount,

            "action_type":
                action_type,

            "created_at":
                datetime.now().isoformat()

        }).execute()

        return jsonify({

            "success": True,

            "message":
                "Bid placed successfully"

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "message": str(e)

        }), 500
    
# ==========================================
# LIVE BIDS
# ==========================================

@app.route(
    "/api/bids/<crop_id>",
    methods=["GET"]
)
def get_bids(crop_id):

    try:

        response = supabase.table(
            "crop_bids"
        ).select("*").eq(
            "crop_id",
            crop_id
        ).order(
            "bid_amount",
            desc=True
        ).execute()

        return jsonify({

            "success": True,

            "bids":
                response.data

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "message": str(e)

        }), 500
    
# ==========================================
# CREATE AUCTION
# ==========================================

@app.route(
    "/api/auction/create",
    methods=["POST"]
)
def create_auction():

    try:

        data = request.get_json()

        crop_id = data.get("crop_id")

        existing = supabase.table(
            "crop_auctions"
        ).select("*").eq(
            "crop_id",
            crop_id
        ).execute()

        if existing.data:

            return jsonify({

                "success": True,

                "message":
                    "Auction already exists",

                "auction":
                    existing.data[0]

            })

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

        return jsonify({

            "success": True,

            "message":
                "Auction Created"

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "message": str(e)

        }), 500
    
# ==========================================
# CLOSE AUCTION
# ==========================================

@app.route(
    "/api/auction/close/<crop_id>",
    methods=["POST"]
)
def close_auction(crop_id):

    try:

        bids = supabase.table(
            "crop_bids"
        ).select("*").eq(
            "crop_id",
            crop_id
        ).order(
            "bid_amount",
            desc=True
        ).execute()

        winning_bid = None

        if bids.data:

            winning_bid = bids.data[0]["id"]

        supabase.table(
            "crop_auctions"
        ).update({

            "auction_status":
                "closed",

            # "winning_bid_id":
            #     winning_bid,

            # "closed_at":
            #     datetime.now().isoformat(),

            "closed_by_pfo":
                True

        }).eq(
            "crop_id",
            crop_id
        ).execute()

        return jsonify({

            "success": True,

            "message":
                "Auction Closed"

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "message": str(e)

        }), 500
    
# ==========================================
# GET HIGHEST BID
# ==========================================

@app.route(
    "/api/bid/highest/<crop_id>",
    methods=["GET"]
)
def highest_bid(crop_id):

    try:

        response = supabase.table(
            "crop_bids"
        ).select("*").eq(
            "crop_id",
            crop_id
        ).order(
            "bid_amount",
            desc=True
        ).limit(1).execute()

        highest_bid = None

        if response.data:

            highest_bid = response.data[0]

        return jsonify({

            "success": True,

            "highest_bid":
                highest_bid

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "message":
                str(e)

        }), 500

# ==========================================
# TOTAL BIDDERS
# ==========================================

@app.route(
    "/api/bid/total-bidders/<crop_id>",
    methods=["GET"]
)
def total_bidders(crop_id):

    try:

        response = supabase.table(
            "crop_bids"
        ).select(
            "bidder_id, bidder_role"
        ).eq(
            "crop_id",
            crop_id
        ).execute()

        unique_bidders = len(
            set([
                f"{bid.get('bidder_id')}_{bid.get('bidder_role', '')}"
                for bid in (response.data or [])
                if bid.get("bidder_id") is not None
            ])
        )

        return jsonify({

            "success": True,

            "total_bidders":
                unique_bidders

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "message":
                str(e)

        }), 500
    
# ==========================================
# BID HISTORY
# ==========================================

@app.route(
    "/api/bid/history/<crop_id>",
    methods=["GET"]
)
def bid_history(crop_id):

    try:

        response = supabase.table(
            "bid_history"
        ).select("*").eq(
            "crop_id",
            crop_id
        ).order(
            "created_at",
            desc=True
        ).execute()

        return jsonify({

            "success": True,

            "history":
                response.data

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "message":
                str(e)

        }), 500
    
# ==========================================
# USER NOTIFICATIONS
# ==========================================
# ==========================================
# USER NOTIFICATIONS
# ==========================================

# ==========================================
# USER NOTIFICATIONS
# ==========================================

@app.route(
    "/api/notifications/<role>/<int:user_id>",
    methods=["GET"]
)
def user_notifications(role, user_id):

    try:

        print("ROLE:", role, "USER ID:", user_id)

        notifications = []
        seen_keys = set()

        # FETCH WON AUCTIONS (OR SOLD AUCTIONS FOR FARMERS)
        if role == "farmer":
            completed = supabase.table("completed_auction_results").select("*").eq("farmer_id", user_id).order("winning_timestamp", desc=True).execute()
        else:
            completed = supabase.table("completed_auction_results").select("*").eq("winner_id", user_id).eq("winner_role", role).order("winning_timestamp", desc=True).execute()

        completed_data = completed.data or []

        # FETCH CORRESPONDING PAYMENT RECORDS
        auction_ids = [item.get("auction_id") for item in completed_data if item.get("auction_id")]
        payments_map = {}
        if auction_ids:
            payments_res = supabase.table("auction_payments").select("auction_id, delivery_status, escrow_enabled, farmer_qr_enabled, dispatch_enabled").in_("auction_id", auction_ids).execute()
            payments_map = {p["auction_id"]: p for p in (payments_res.data or [])}

        for item in completed_data:
            c_name = item.get("crop_name")
            f_bid = item.get("final_bid")
            # Only add valid items that are not empty/null
            if not c_name or f_bid is None:
                continue

            auc_id = item.get("auction_id")
            crop_id = item.get("crop_id")
            if auc_id:
                seen_keys.add(f"auction_{auc_id}")
            if crop_id:
                seen_keys.add(f"crop_{crop_id}")

            notifications.append({
                "id": item.get("id"),
                "auction_id": auc_id,
                "title": "Auction Completed" if role == "farmer" else "Auction Won",
                "message": f"Congratulations! Your crop {c_name} has been sold for ₹{f_bid}." if role == "farmer" else f"Congratulations! You won the auction for {c_name} with a bid of ₹{f_bid}.",
                "crop_name": c_name,
                "crop_category": item.get("crop_category") or "Agriculture",
                "crop_quantity": item.get("crop_quantity") or "N/A",
                "final_bid": f_bid,
                "farmer_name": item.get("farmer_name") or "Farmer",
                "farmer_email": item.get("farmer_email") or "N/A",
                "farmer_phone": item.get("farmer_phone") or "N/A",
                "farmer_district": item.get("farmer_district") or "N/A",
                "winner_name": item.get("winner_name") or "Winner",
                "winner_email": item.get("winner_email") or "N/A",
                "winner_phone": item.get("winner_phone") or "N/A",
                "escrow_enabled": payments_map.get(auc_id, {}).get("escrow_enabled", False),
                "escrow_status": item.get("escrow_status") or "Waiting For Escrow Payment",
                "farmer_qr_enabled": payments_map.get(auc_id, {}).get("farmer_qr_enabled", False),
                "send_crops_enabled": payments_map.get(auc_id, {}).get("dispatch_enabled", False),
                "delivery_status": payments_map.get(auc_id, {}).get("delivery_status", "Pending Dispatch"),
                "created_at": item.get("winning_timestamp") or datetime.now().isoformat()
            })

        # FETCH NORMAL NOTIFICATIONS FROM TABLE
        response = supabase.table(
            "auction_notifications"
        ).select("*").eq(
            "user_role",
            role
        ).eq(
            "user_id",
            user_id
        ).order(
            "created_at",
            desc=True
        ).execute()

        if response.data:
            for notif in response.data:
                c_id = notif.get("crop_id")
                a_id = notif.get("auction_id")
                # Exclude duplicate notifications that match a completed auction card
                if (c_id and f"crop_{c_id}" in seen_keys) or (a_id and f"auction_{a_id}" in seen_keys):
                    continue
                if notif.get("title") in ["Auction Won", "Auction Completed"]:
                    continue

                notifications.append(notif)

        notifications = sorted(
            notifications,
            key=lambda x: x.get("created_at", "") or "",
            reverse=True
        )

        print("TOTAL NOTIFICATIONS:", len(notifications))

        return jsonify({
            "success": True,
            "notifications": notifications
        })

    except Exception as e:
        print("NOTIFICATION ERROR:", e)
        import traceback
        print(traceback.format_exc())
        return jsonify({
            "success": False,
            "notifications": [],
            "message": str(e)
        }), 500

        return jsonify({

            "success": False,

            "message":
                str(e)

        }), 500
# ==========================================
# MATCHED CROPS
# ==========================================

@app.route(
    "/api/matches/<role>/<int:user_id>",
    methods=["GET"]
)
def matched_crops(role, user_id):

    try:

        # ==================================
        # REQUEST TABLE
        # ==================================

        table_name = ""

        if role == "dealer":

            table_name = \
                "dealer_crop_requests"

        else:

            table_name = \
                "retailer_crop_requests"

        # ==================================
        # USER REQUESTS
        # ==================================

        requests_response = supabase.table(
            table_name
        ).select("*").eq(
            "user_id",
            user_id
        ).execute()

        requests_data = \
            requests_response.data

        # ==================================
        # VERIFIED CROPS
        # ==================================

        crops_response = supabase.table(
            "crops"
        ).select("*").eq(
            "verification_status",
            "verified"
        ).execute()

        verified_crops = \
            crops_response.data

        matched_crops = []
        seen_crop_ids = set()

        # ==================================
        # FUZZY MATCH
        # ==================================

        for request in requests_data:

            request_crop = request[
                "crop_type"
            ]

            for crop in verified_crops:

                if crop["id"] in seen_crop_ids:
                    continue

                crop_name = crop[
                    "crop_name"
                ]

                score = similarity(
                    request_crop,
                    crop_name
                )

                if score >= 0.65:

                    crop["match_score"] = round(
                        score * 100,
                        2
                    )

                    auction_response = supabase.table(
                        "crop_auctions"
                    ).select("*").eq(
                        "crop_id",
                        crop["id"]
                    ).execute()

                    if auction_response.data:
                        crop["auction_end"] = (
                            auction_response.data[0].get(
                                "auction_end"
                            )
                        )
                        crop["auction_status"] = (
                            auction_response.data[0].get(
                                "auction_status",
                                "active"
                            )
                        )

                    matched_crops.append(crop)
                    seen_crop_ids.add(crop["id"])

        return jsonify({

            "success": True,

            "matches":
                matched_crops

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "message":
                str(e)

        }), 500
    
# ==========================================
# AUCTION STATUS
# ==========================================

@app.route(
    "/api/auction/status/<crop_id>",
    methods=["GET"]
)
def auction_status(crop_id):

    try:

        response = supabase.table(
            "crop_auctions"
        ).select("*").eq(
            "crop_id",
            crop_id
        ).execute()

        auction = None

        if response.data:

            auction = response.data[0]

        return jsonify({

            "success": True,

            "auction":
                auction

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "message":
                str(e)

        }), 500
    
# ==========================================
# FARMER LIVE BIDS
# ==========================================

@app.route(
    "/api/farmer/live-bids/<farmer_id>",
    methods=["GET"]
)
def farmer_live_bids(farmer_id):

    try:

        crops_response = supabase.table(
            "crops"
        ).select("*").eq(
            "farmer_id",
            farmer_id
        ).execute()

        crops = crops_response.data or []

        all_bids = []

        for crop in crops:

            bids = supabase.table(
                "crop_bids"
            ).select("*").eq(
                "crop_id",
                crop["id"]
            ).eq(
                "bid_status",
                "active"
            ).order(
                "bid_amount",
                desc=True
            ).execute()

            auction_response = supabase.table(
                "crop_auctions"
            ).select("*").eq(
                "crop_id",
                crop["id"]
            ).execute()

            auction = (
                auction_response.data[0]
                if auction_response.data else None
            )

            all_bids.append({

                "crop":
                    crop,

                "bids":
                    bids.data,

                "auction":
                    auction

            })

        return jsonify({

            "success": True,

            "live_bids":
                all_bids

        })

    except Exception as e:
        import traceback
        print("FARMER LIVE BIDS ERROR", e)
        print(traceback.format_exc())

        return jsonify({

            "success": False,

            "message":
                str(e) + " " + traceback.format_exc()

        }), 500


    
# ==========================================
# PFO LIVE AUCTIONS
# ==========================================

@app.route(
    "/api/pfo/live-auctions/<district>",
    methods=["GET"]
)
def pfo_live_auctions(district):

    try:

        # VERIFIED CROPS
        crops_response = supabase.table(
            "crops"
        ).select("*").eq(
            "district",
            district
        ).eq(
            "verification_status",
            "verified"
        ).execute()

        crops = crops_response.data or []

        crop_images_response = supabase.table("crop_images").select("*").execute()
        image_map = {
            str(img.get("crop_id")): img.get("image_url", "")
            for img in (crop_images_response.data or [])
        }

        auction_data = []

        for crop in crops:
            c_id_str = str(crop.get("id"))
            if not crop.get("image_url"):
                crop["image_url"] = image_map.get(c_id_str, "")

            # HIGHEST BID
            bids_response = supabase.table(
                "crop_bids"
            ).select("*").eq(
                "crop_id",
                crop["id"]
            ).order(
                "bid_amount",
                desc=True
            ).execute()

            highest_bid = None

            total_bidders = 0

            if bids_response.data:

                highest_bid = bids_response.data[0]

                total_bidders = len(
                    set([
                        f"{bid.get('bidder_id')}_{bid.get('bidder_role', '')}"
                        for bid in (bids_response.data or [])
                        if bid.get("bidder_id") is not None
                    ])
                )

            # AUCTION
            auction_response = supabase.table(
                "crop_auctions"
            ).select("*").eq(
                "crop_id",
                crop["id"]
            ).execute()

            auction = None

            if auction_response.data:

                auction = \
                    auction_response.data[0]

            auction_data.append({

                "crop":
                    crop,

                "highest_bid":
                    highest_bid,

                "total_bidders":
                    total_bidders,

                "auction":
                    auction
            })

        return jsonify({

            "success": True,

            "auctions":
                auction_data

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "message":
                str(e)

        }), 500
    
# ==========================================
# SAVE COMPLETED AUCTION RESULT
# ==========================================

def save_completed_auction_result(

    crop_data,
    winning_bid,
    farmer,
    winner_user,
    pfo_data,
    auction_data
):

    try:

        institution_name = "N/A"

        # ==================================
        # DEALER INSTITUTION
        # ==================================

        if (
            winning_bid.get(
                "bidder_role"
            ) == "dealer"
        ):

            try:

                institution_name = decrypt_data(

                    winner_user.get(
                        "institution_encrypted",
                        ""
                    )
                )

            except:

                institution_name = "N/A"

        # ==================================
        # INSERT RESULT
        # ==================================

        data_to_save = {
            "crop_id": crop_data.get("id") if crop_data else None,
            "auction_id": auction_data.get("id") if auction_data else None,
            "farmer_id": farmer.get("id") if farmer else None,
            "winner_id": winner_user.get("id") if winner_user else None,
            "winner_role": winning_bid.get("bidder_role") if winning_bid else "N/A",
            "pfo_id": pfo_data.get("id") if pfo_data else None,
            "crop_name": crop_data.get("crop_name") if crop_data else "N/A",
            "crop_category": crop_data.get("crop_category") if crop_data else "N/A",
            "crop_quantity": f"{crop_data.get('quantity', '0')} {crop_data.get('unit', '')}" if crop_data else "N/A",
            "base_price": crop_data.get("expected_price") if crop_data else 0,
            "final_bid": winning_bid.get("bid_amount") if winning_bid else 0,
            "auction_start": auction_data.get("auction_start") if auction_data else None,
            "auction_end": auction_data.get("auction_end") if auction_data else None,
            "winning_timestamp": datetime.now().isoformat(),
            "farmer_name": farmer.get("full_name") if farmer else "N/A",
            "farmer_username": farmer.get("username") if farmer else "N/A",
            "farmer_district": farmer.get("district") if farmer else "N/A",
            "farmer_email": farmer.get("email") if farmer else "N/A",
            "farmer_phone": farmer.get("phone", "N/A") if farmer else "N/A",
            "winner_name": winner_user.get("full_name") if winner_user else "N/A",
            "winner_username": winner_user.get("username") if winner_user else "N/A",
            "winner_email": winner_user.get("email") if winner_user else "N/A",
            "winner_phone": winner_user.get("phone", "N/A") if winner_user else "N/A",
            "institution_name": institution_name,
            "pfo_name": pfo_data.get("pfo_name", "N/A") if pfo_data else "N/A",
            "pfo_district": pfo_data.get("district", "N/A") if pfo_data else "N/A",
            "verification_status": "Verified Auction",
            "escrow_status": "Waiting For Escrow Payment"
        }

        supabase.table("completed_auction_results").insert(data_to_save).execute()

        print(
            "COMPLETED AUCTION SAVED"
        )

        # Auto update retailer inventory if winner is retailer/dealer
        add_auction_to_retailer_inventory(data_to_save)

        # Log single 'Auction Won' event into traceability history
        try:
            w_name = winner_user.get("full_name") or winner_user.get("username") or winner_user.get("name") or "Winner"
            raw_wrole = winning_bid.get("bidder_role") if winning_bid else "Dealer"
            w_role = str(raw_wrole or "Dealer").capitalize()
            final_bid_price = winning_bid.get("bid_amount") if winning_bid else 0
            price_val = float(final_bid_price or 0)
            price_str = int(price_val) if price_val.is_integer() else price_val
            
            log_traceability_event(
                crop_id=crop_data.get("id"),
                traceability_id=crop_data.get("qr_traceability_id"),
                performed_by=w_name,
                role=w_role,
                action="Auction Won",
                price=final_bid_price,
                location=f"{crop_data.get('district') or 'Karnataka'}, Karnataka",
                remarks=f"This auction was won by {w_name} ({w_role}) with the highest bid of ₹{price_str}.",
                status="Auction Completed"
            )
        except Exception as trace_err:
            print(f"[Traceability Log Error] Failed to log Auction Won: {trace_err}")

    except Exception as e:

        print(
            "SAVE COMPLETED AUCTION ERROR:",
            e
        )

def add_auction_to_retailer_inventory(auction_data):
    try:
        if not auction_data:
            return
        winner_role = str(auction_data.get("winner_role", "")).lower()
        winner_id = auction_data.get("winner_id")
        auction_id = auction_data.get("auction_id") or auction_data.get("id")

        if winner_role == "retailer" and winner_id and auction_id:
            try:
                winner_id_int = int(winner_id)
                auction_id_int = int(auction_id)
            except (ValueError, TypeError):
                print(f"[Retailer Inventory Warning] Invalid numeric IDs: winner_id={winner_id}, auction_id={auction_id}")
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
        print("[ERROR ADDING TO RETAILER INVENTORY]:", inv_err)
# ==========================================
# FINALIZE WINNER
# ==========================================

# ==========================================
# FINALIZE WINNER
# ==========================================

# ==========================================
# FINALIZE WINNER
# ==========================================

@app.route(
    "/api/auction/finalize/<crop_id>",
    methods=["POST"]
)
def finalize_winner(crop_id):

    try:

        print(
            "FINALIZE STARTED"
        )

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

                "message":
                    "Crop not found"

            }), 404

        crop_data = \
            crop_response.data[0]

        print(
            "CROP FETCHED"
        )

        # ==================================
        # FETCH HIGHEST BID
        # ==================================

        bids_response = supabase.table(
            "crop_bids"
        ).select("*").eq(
            "crop_id",
            crop_id
        ).order(
            "bid_amount",
            desc=True
        ).limit(1).execute()

        if not bids_response.data:

            return jsonify({

                "success": False,

                "message":
                    "No bids found"

            }), 404

        winning_bid = \
            bids_response.data[0]

        print(
            "WINNING BID FETCHED"
        )

        # ==================================
        # CLOSE AUCTION
        # ==================================

        supabase.table(
            "crop_auctions"
        ).update({

            "auction_status":
                "closed",

            "closed_by_pfo":
                True

        }).eq(
            "crop_id",
            crop_id
        ).execute()

        print(
            "AUCTION CLOSED"
        )

        # ==================================
        # FETCH FARMER
        # ==================================

        farmer = get_user_by_role(

            crop_data.get("farmer_id"),

            "farmer"
        )

        print(
            "FARMER FETCHED"
        )

        # ==================================
        # FETCH WINNER
        # ==================================

        winner_user = get_user_by_role(

            winning_bid["bidder_id"],

            winning_bid["bidder_role"]
        )

        print(
            "WINNER FETCHED"
        )

        # ==================================
        # FETCH PFO
        # ==================================

        pfo_response = supabase.table(
            "pfo_accounts"
        ).select("*").eq(
            "district",
            crop_data.get("district")
        ).execute()

        pfo_data = (
            pfo_response.data[0]
            if pfo_response.data
            else {}
        )

        print(
            "PFO FETCHED"
        )

        # ==================================
        # FETCH AUCTION
        # ==================================

        auction_response = supabase.table(
            "crop_auctions"
        ).select("*").eq(
            "crop_id",
            crop_id
        ).execute()

        auction_data = (
            auction_response.data[0]
            if auction_response.data
            else {}
        )

        print(
            "AUCTION DATA FETCHED"
        )

        # ==================================
        # SEND FARMER MAIL
        # ==================================

        try:

            if farmer and farmer.get("email"):

                send_notification_mail(

                    farmer["email"],

                    "Auction Completed",

                    f"""

Congratulations.

Your crop:
{crop_data.get('crop_name')}

has been sold successfully.

Winning Bid:
₹{winning_bid.get('bid_amount')}

"""
                )

                print(
                    "FARMER MAIL SENT"
                )

        except Exception as mail_error:

            print(
                "FARMER MAIL ERROR:",
                mail_error
            )

        # ==================================
        # SEND WINNER MAIL
        # ==================================

        try:

            if (
                winner_user
                and winner_user.get(
                    "email"
                )
            ):

                send_notification_mail(

                    winner_user["email"],

                    "Auction Winner",

                    f"""

Congratulations.

You won the auction for:

{crop_data.get('crop_name')}

Winning Amount:
₹{winning_bid.get('bid_amount')}

"""
                )

                print(
                    "WINNER MAIL SENT"
                )
        
                

        except Exception as mail_error:

            print(
                "WINNER MAIL ERROR:",
                mail_error
            )

        # ==================================
        # SAVE ADMIN RESULT
        # ==================================

        try:

            save_completed_auction_result(

                crop_data,

                winning_bid,

                farmer,

                winner_user,

                pfo_data,

                auction_data
            )

            print(
                "ADMIN RESULT SAVED"
            )

        except Exception as save_error:

            print(
                "SAVE ERROR:",
                save_error
            )

        # ==================================
        # SUCCESS
        # ==================================

        return jsonify({

            "success": True,

            "message":
                "Auction finalized successfully"

        })

    except Exception as e:

        print(
            "FINALIZE ERROR:",
            e
        )

        import traceback

        print(
            traceback.format_exc()
        )

        return jsonify({

            "success": False,

            "message":
                str(e)

        }), 500
    

# ==========================================
# GET COMPLETED AUCTIONS
# ==========================================

@app.route(
    "/api/admin/completed-auctions",
    methods=["GET"]
)
def get_completed_auctions():

    try:

        response = supabase.table(
            "completed_auction_results"
        ).select("*").order(
            "winning_timestamp",
            desc=True
        ).execute()

        return jsonify(
            response.data or []
        )

    except Exception as e:

        print(
            "FETCH COMPLETED AUCTIONS ERROR:",
            e
        )

        return jsonify([]), 500

# ==========================================
# RETAILER & CUSTOMER DASHBOARD REDESIGN APIS
# ==========================================

import math

def calculate_distance(lat1, lon1, lat2, lon2):
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return float('inf')
    try:
        lat1, lon1, lat2, lon2 = float(lat1), float(lon1), float(lat2), float(lon2)
        R = 6371.0  # Earth's radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
        a = min(1.0, max(0.0, a))
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return R * c
    except Exception as e:
        print("Distance calculation error:", e)
        return float('inf')

# 1. Retailer Profile GET/POST
@app.route("/api/retailer/profile/<int:retailer_id>", methods=["GET", "POST"])
def handle_retailer_profile(retailer_id):
    if request.method == "GET":
        try:
            res = supabase.table("retailers").select("*").eq("id", retailer_id).execute()
            if res.data:
                return jsonify({"success": True, "profile": res.data[0]}), 200
            return jsonify({"success": False, "message": "Retailer not found"}), 404
        except Exception as e:
            return jsonify({"success": False, "message": str(e)}), 500

    elif request.method == "POST":
        try:
            data = request.form.to_dict() if request.form else request.get_json()
            full_name = data.get("full_name") or data.get("owner_name")
            business_name = data.get("business_name")
            mobile_number = data.get("mobile_number")
            address = data.get("address")
            state = data.get("state")
            district = data.get("district")
            city_village = data.get("city_village") or data.get("city")
            pin_code = data.get("pin_code")
            
            latitude = data.get("latitude")
            longitude = data.get("longitude")
            
            update_data = {}
            if full_name: update_data["full_name"] = full_name
            if business_name is not None: update_data["business_name"] = business_name
            if mobile_number is not None: update_data["mobile_number"] = mobile_number
            if address is not None: update_data["address"] = address
            if state is not None: update_data["state"] = state
            if district is not None: update_data["district"] = district
            if city_village is not None: update_data["city_village"] = city_village
            if pin_code is not None: update_data["pin_code"] = pin_code
            
            if latitude != "" and latitude is not None:
                update_data["latitude"] = float(latitude)
            if longitude != "" and longitude is not None:
                update_data["longitude"] = float(longitude)

            # File uploads
            from payment import upload_file_to_supabase
            profile_photo_file = request.files.get("profile_photo")
            if profile_photo_file:
                photo_url = upload_file_to_supabase("payment-proofs", profile_photo_file, "profile_photos")
                if photo_url:
                    update_data["profile_photo"] = photo_url

            shop_photo_file = request.files.get("shop_photo")
            if shop_photo_file:
                photo_url = upload_file_to_supabase("payment-proofs", shop_photo_file, "shop_photos")
                if photo_url:
                    update_data["shop_photo"] = photo_url

            res = supabase.table("retailers").update(update_data).eq("id", retailer_id).execute()
            if res.data:
                return jsonify({"success": True, "message": "Profile updated successfully", "profile": res.data[0]}), 200
            return jsonify({"success": False, "message": "Failed to update profile"}), 400
        except Exception as e:
            print("PROFILE UPDATE ERROR:", e)
            return jsonify({"success": False, "message": str(e)}), 500

# 2. Customer Profile GET/POST
@app.route("/api/customer/profile/<int:customer_id>", methods=["GET", "POST"])
def handle_customer_profile(customer_id):
    if request.method == "GET":
        try:
            res = supabase.table("customers").select("*").eq("id", customer_id).execute()
            if res.data:
                return jsonify({"success": True, "profile": res.data[0]}), 200
            return jsonify({"success": False, "message": "Customer not found"}), 404
        except Exception as e:
            return jsonify({"success": False, "message": str(e)}), 500

    elif request.method == "POST":
        try:
            data = request.get_json()
            full_name = data.get("full_name") or data.get("name")
            mobile_number = data.get("mobile_number")
            address = data.get("address")
            state = data.get("state")
            district = data.get("district")
            city_village = data.get("city_village") or data.get("city")
            pin_code = data.get("pin_code")
            
            latitude = data.get("latitude")
            longitude = data.get("longitude")

            update_data = {}
            if full_name: update_data["full_name"] = full_name
            if mobile_number is not None: update_data["mobile_number"] = mobile_number
            if address is not None: update_data["address"] = address
            if state is not None: update_data["state"] = state
            if district is not None: update_data["district"] = district
            if city_village is not None: update_data["city_village"] = city_village
            if pin_code is not None: update_data["pin_code"] = pin_code
            
            if latitude != "" and latitude is not None:
                update_data["latitude"] = float(latitude)
            if longitude != "" and longitude is not None:
                update_data["longitude"] = float(longitude)

            res = supabase.table("customers").update(update_data).eq("id", customer_id).execute()
            if res.data:
                return jsonify({"success": True, "message": "Profile updated successfully", "profile": res.data[0]}), 200
            return jsonify({"success": False, "message": "Failed to update profile"}), 400
        except Exception as e:
            print("CUSTOMER PROFILE UPDATE ERROR:", e)
            return jsonify({"success": False, "message": str(e)}), 500

# 3. Retailer Inventory GET/PUT
@app.route("/api/retailer/inventory/<int:retailer_id>", methods=["GET"])
def get_retailer_inventory(retailer_id):
    try:
        # Auto-sync completed auctions won by this retailer
        completed_res = supabase.table("completed_auction_results").select("*").eq("winner_id", retailer_id).execute()
        if completed_res.data:
            for item in completed_res.data:
                add_auction_to_retailer_inventory(item)

        res = supabase.table("retailer_inventory").select("*").eq("retailer_id", retailer_id).order("purchase_date", desc=True).execute()
        return jsonify({"success": True, "inventory": res.data or []}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route("/api/retailer/inventory/update-price/<uuid:inventory_id>", methods=["PUT"])
def update_inventory_price(inventory_id):
    try:
        data = request.get_json()
        selling_price = data.get("selling_price")
        if selling_price is None or float(selling_price) < 0:
            return jsonify({"success": False, "message": "Invalid selling price"}), 400
            
        res = supabase.table("retailer_inventory").update({"selling_price": float(selling_price)}).eq("id", str(inventory_id)).execute()
        if res.data:
            return jsonify({"success": True, "message": "Price updated successfully", "item": res.data[0]}), 200
        return jsonify({"success": False, "message": "Inventory item not found"}), 404
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# 4. Customer Nearby Retailers GET
@app.route("/api/customer/nearby-retailers/<int:customer_id>", methods=["GET"])
def get_nearby_retailers(customer_id):
    try:
        cust_res = supabase.table("customers").select("*").eq("id", customer_id).execute()
        if not cust_res.data:
            return jsonify({"success": False, "message": "Customer not found"}), 404
        
        customer = cust_res.data[0]
        cust_lat = customer.get("latitude")
        cust_lng = customer.get("longitude")

        # Allow query parameter overrides for real-time GPS coordinates
        if request.args.get("lat") and request.args.get("lng"):
            try:
                cust_lat = float(request.args.get("lat"))
                cust_lng = float(request.args.get("lng"))
            except (ValueError, TypeError):
                pass
        
        # Fetch retailers
        try:
            ret_res = supabase.table("retailers").select("*").execute()
            retailers = ret_res.data or []
        except Exception:
            retailers = []

        # Fetch dealers
        try:
            dealers_res = supabase.table("dealers").select("*").execute()
            dealers = dealers_res.data or []
        except Exception:
            dealers = []
        
        result = []
        for r in retailers:
            r_lat = r.get("latitude")
            r_lng = r.get("longitude")
            r_info = {k: v for k, v in r.items() if k != "password"}
            r_info["shop_type"] = "Retailer"
            
            if cust_lat is not None and cust_lng is not None and r_lat is not None and r_lng is not None:
                dist = calculate_distance(cust_lat, cust_lng, r_lat, r_lng)
                r_info["distance"] = round(dist, 2) if dist != float('inf') else None
            else:
                r_info["distance"] = None
                
            result.append(r_info)

        for d in dealers:
            d_lat = d.get("latitude")
            d_lng = d.get("longitude")
            d_info = {k: v for k, v in d.items() if k != "password"}
            d_info["shop_type"] = "Dealer"
            
            if cust_lat is not None and cust_lng is not None and d_lat is not None and d_lng is not None:
                dist = calculate_distance(cust_lat, cust_lng, d_lat, d_lng)
                d_info["distance"] = round(dist, 2) if dist != float('inf') else None
            else:
                d_info["distance"] = None
                
            result.append(d_info)
            
        # Fix sorting key: preserve 0.0 distance values and place Nones at the end
        result.sort(key=lambda x: (x["distance"] is None, x["distance"] if x["distance"] is not None else float('inf')))
        return jsonify({"success": True, "retailers": result}), 200
    except Exception as e:
        print("NEARBY RETAILERS ERROR:", e)
        return jsonify({"success": False, "message": str(e)}), 500

# 5. Customer Select Retailer POST
@app.route("/api/customer/select-retailer", methods=["POST"])
def select_retailer():
    try:
        data = request.get_json()
        customer_id = data.get("customer_id")
        retailer_id = data.get("retailer_id")
        
        res = supabase.table("customers").update({"selected_retailer_id": retailer_id}).eq("id", customer_id).execute()
        if res.data:
            return jsonify({"success": True, "message": "Retailer selection updated", "customer": res.data[0]}), 200
        return jsonify({"success": False, "message": "Customer not found"}), 404
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# 6. Customer Get Retailer Inventory GET
@app.route("/api/customer/retailer-inventory/<int:retailer_id>", methods=["GET"])
def get_customer_retailer_inventory(retailer_id):
    try:
        res = supabase.table("retailer_inventory").select("*").eq("retailer_id", retailer_id).gt("quantity_available", 0).execute()
        return jsonify({"success": True, "inventory": res.data or []}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# 7. Customer Place Order POST
@app.route("/api/customer/order", methods=["POST"])
def place_customer_order():
    try:
        data = request.get_json()
        customer_id = data.get("customer_id")
        retailer_id = data.get("retailer_id")
        delivery_address = data.get("delivery_address")
        payment_method = data.get("payment_method", "Cash on Delivery")
        items = data.get("items", []) # [{ inventory_id, quantity }]
        
        if not customer_id or not retailer_id or not items:
            return jsonify({"success": False, "message": "Missing required order data"}), 400
            
        total_amount = 0.0
        verified_items = []
        
        for item in items:
            inv_id = item.get("inventory_id")
            req_qty = float(item.get("quantity", 0))
            
            if req_qty <= 0:
                return jsonify({"success": False, "message": "Quantity must be greater than zero"}), 400
                
            inv_res = supabase.table("retailer_inventory").select("*").eq("id", inv_id).execute()
            if not inv_res.data:
                return jsonify({"success": False, "message": "Product not found in inventory"}), 404
                
            inv_item = inv_res.data[0]
            if int(inv_item.get("retailer_id")) != int(retailer_id):
                return jsonify({"success": False, "message": "Product does not belong to the selected retailer"}), 400
                
            avail_qty = float(inv_item.get("quantity_available", 0))
            if req_qty > avail_qty:
                return jsonify({"success": False, "message": f"Insufficient stock for {inv_item.get('crop_name')}. Available: {avail_qty} {inv_item.get('unit')}"}), 400
                
            selling_price = float(inv_item.get("selling_price", 0))
            item_total = selling_price * req_qty
            total_amount += item_total
            
            verified_items.append({
                "inventory_item": inv_item,
                "req_qty": req_qty,
                "price_per_unit": selling_price,
                "total_price": item_total
            })
            
        # Insert Order
        order_res = supabase.table("customer_orders").insert({
            "customer_id": customer_id,
            "retailer_id": retailer_id,
            "total_amount": total_amount,
            "delivery_address": delivery_address,
            "payment_method": payment_method,
            "status": "Pending"
        }).execute()
        
        if not order_res.data:
            return jsonify({"success": False, "message": "Failed to create order"}), 500
            
        order = order_res.data[0]
        order_id = order.get("id")
        
        # Update Inventory and Insert Items
        for vi in verified_items:
            inv_item = vi["inventory_item"]
            req_qty = vi["req_qty"]
            new_avail_qty = float(inv_item.get("quantity_available")) - req_qty
            
            # Deduct stock
            supabase.table("retailer_inventory").update({
                "quantity_available": new_avail_qty
            }).eq("id", inv_item.get("id")).execute()
            
            # Insert item
            supabase.table("order_items").insert({
                "order_id": order_id,
                "inventory_item_id": inv_item.get("id"),
                "crop_name": inv_item.get("crop_name"),
                "quantity": req_qty,
                "unit": inv_item.get("unit"),
                "price_per_unit": vi["price_per_unit"],
                "total_price": vi["total_price"]
            }).execute()
            
        return jsonify({"success": True, "message": "Order placed successfully", "order": order}), 200
    except Exception as e:
        print("ORDER PLACEMENT ERROR:", e)
        return jsonify({"success": False, "message": str(e)}), 500

# 8. Customer Order History GET
@app.route("/api/customer/orders/<int:customer_id>", methods=["GET"])
def get_customer_orders(customer_id):
    try:
        orders_res = supabase.table("customer_orders").select("*").eq("customer_id", customer_id).order("created_at", desc=True).execute()
        orders = orders_res.data or []
        
        for o in orders:
            ret_res = supabase.table("retailers").select("business_name, full_name").eq("id", o["retailer_id"]).execute()
            if ret_res.data:
                o["retailer"] = ret_res.data[0]
            else:
                o["retailer"] = {"business_name": "Unknown", "full_name": "Unknown"}
                
            items_res = supabase.table("order_items").select("*").eq("order_id", o["id"]).execute()
            o["items"] = items_res.data or []
            
        return jsonify({"success": True, "orders": orders}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# 9. Retailer Order History GET
@app.route("/api/retailer/orders/<int:retailer_id>", methods=["GET"])
def get_retailer_orders(retailer_id):
    try:
        orders_res = supabase.table("customer_orders").select("*").eq("retailer_id", retailer_id).order("created_at", desc=True).execute()
        orders = orders_res.data or []
        
        for o in orders:
            cust_res = supabase.table("customers").select("full_name, mobile_number").eq("id", o["customer_id"]).execute()
            if cust_res.data:
                o["customer"] = cust_res.data[0]
            else:
                o["customer"] = {"full_name": "Unknown", "mobile_number": "N/A"}
                
            items_res = supabase.table("order_items").select("*").eq("order_id", o["id"]).execute()
            o["items"] = items_res.data or []
            
        return jsonify({"success": True, "orders": orders}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# 10. Retailer Update Order Status PUT
@app.route("/api/retailer/order/update-status/<uuid:order_id>", methods=["PUT"])
def update_order_status(order_id):
    try:
        data = request.get_json()
        status = data.get("status")
        
        if status not in ['Pending', 'Dispatched', 'Delivered', 'Cancelled']:
            return jsonify({"success": False, "message": "Invalid order status"}), 400
            
        res = supabase.table("customer_orders").update({"status": status}).eq("id", str(order_id)).execute()
        if res.data:
            return jsonify({"success": True, "message": f"Order status updated to {status}", "order": res.data[0]}), 200
        return jsonify({"success": False, "message": "Order not found"}), 404
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# ==========================================
# MAIN
# ==========================================

if __name__ == "__main__":
    app.run(debug=True)
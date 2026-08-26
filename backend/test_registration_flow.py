import traceback
from app import app, otp_storage, pending_registrations

app.testing = True
client = app.test_client()

email = "test@example.com"

# Step 1: Register (farmer)
reg_payload = {
    "role": "farmer",
    "full_name": "Test Farmer",
    "username": "testfarmer",
    "age": 30,
    "district": "TestDistrict",
    "aadhaar": "123412341234",
    "email": email,
    "password": "pass123",
    "acres": 5
}

print("POST /api/register")
resp = client.post("/api/register", json=reg_payload)
print("status:", resp.status_code)
print("data:", resp.get_json())

print("otp_storage:", otp_storage)
print("pending_registrations:", pending_registrations.keys())

# If OTP exists, proceed to verify
if email in otp_storage:
    otp = otp_storage[email]["otp"]
    print("Using OTP:", otp)
    verify_payload = {
        "role": "farmer",
        "full_name": "Test Farmer",
        "username": "testfarmer",
        "district": "TestDistrict",
        "email": email,
        "password": "pass123",
        "otp": otp
    }
    try:
        print("POST /api/verify-otp-register")
        resp2 = client.post("/api/verify-otp-register", json=verify_payload)
        print("status:", resp2.status_code)
        print("data:", resp2.get_json())
    except Exception as e:
        print("Exception during verify:")
        traceback.print_exc()
else:
    print("No OTP generated; cannot verify")

print("Done")

# Additional checks: try login (should be blocked until approved)
print('\nAttempting login after verification (should be pending)')
login_payload = {"role": "farmer", "username": "testfarmer", "password": "pass123"}
resp3 = client.post('/api/user/login', json=login_payload)
print('login status:', resp3.status_code)
print('login data:', resp3.get_json())

# Fetch pending requests for district
print('\nFetching pending requests for district TestDistrict')
resp4 = client.get('/api/pfo/pending/TestDistrict')
print('pending status:', resp4.status_code)
print('pending data:', resp4.get_json())

# If we have a pending farmer, approve them
pending = resp4.get_json() or {}
farmers = pending.get('farmers') or []
if farmers:
    user_id = farmers[0]['id']
    print('\nApproving user id', user_id)
    approve_payload = {"role": "farmer", "user_id": user_id, "pfo_id": 0}
    resp5 = client.post('/api/pfo/approve', json=approve_payload)
    print('approve status:', resp5.status_code)
    print('approve data:', resp5.get_json())

    # Try login again
    print('\nRetrying login after approval')
    resp6 = client.post('/api/user/login', json=login_payload)
    print('login status:', resp6.status_code)
    print('login data:', resp6.get_json())
else:
    print('No pending farmers found to approve')

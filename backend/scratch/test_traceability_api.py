import os
from supabase import create_client
from dotenv import load_dotenv

script_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(script_dir, "..", ".env")
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def test_api():
    print("Testing Supabase crop QR and crops retrieval...")
    res = supabase.table("crops").select("id, qr_traceability_id, crop_name, verification_status").limit(3).execute()
    print("Sample Crops in DB:")
    for crop in res.data or []:
        print(f" - Crop ID: {crop.get('id')} | Traceability ID: {crop.get('qr_traceability_id')} | Name: {crop.get('crop_name')} | Status: {crop.get('verification_status')}")

if __name__ == "__main__":
    test_api()

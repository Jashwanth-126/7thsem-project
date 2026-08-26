import os
from supabase import create_client
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def test_insert():
    test_data = {
        "auction_id": 9999,
        "crop_id": 9999,
        "farmer_id": 1,
        "winner_id": 2,
        "winner_role": "dealer",
        "crop_name": "Test Crop",
        "crop_category": "Test Category",
        "crop_quantity": "100 kg",
        "base_price": 1000,
        "final_bid": 1500,
        "winning_timestamp": datetime.now().isoformat(),
        "pfo_district": "Hassan",
        "escrow_status": "Waiting For Escrow Payment"
    }
    try:
        response = supabase.table("completed_auction_results").insert(test_data).execute()
        print("Insert successful!")
        print(response.data)
    except Exception as e:
        print(f"Insert failed: {e}")

if __name__ == "__main__":
    test_insert()

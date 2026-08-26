import os
from supabase import create_client
from dotenv import load_dotenv

# load env from backend/.env
script_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(script_dir, "..", ".env")
print(f"Loading env from: {env_path}")
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
print(f"SUPABASE_URL: {SUPABASE_URL}")
if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL not loaded!")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def inspect():
    tables = ["retailers", "customers", "completed_auction_results", "crops", "crop_deliveries", "auction_payments"]
    for t in tables:
        try:
            res = supabase.table(t).select("*").limit(1).execute()
            print(f"Table: {t}")
            if res.data:
                print(f"  Columns: {list(res.data[0].keys())}")
                print(f"  Sample row: {res.data[0]}")
            else:
                print("  Table empty, no sample row.")
        except Exception as e:
            print(f"Table {t} inspect failed: {e}")

if __name__ == "__main__":
    inspect()

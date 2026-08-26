import os
from supabase import create_client
from dotenv import load_dotenv

script_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(script_dir, "..", ".env")
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def inspect_tables():
    print("Checking Escrow Payment Tables in Supabase...")
    tables = ["auction_payments", "completed_auction_results", "admin_escrow_qr", "crop_deliveries", "traceability_history"]
    for t in tables:
        try:
            res = supabase.table(t).select("*").limit(1).execute()
            print(f"[SUCCESS] Table '{t}' exists and is accessible. Rows returned: {len(res.data)}")
            if res.data:
                print(f"   Columns in '{t}': {list(res.data[0].keys())}")
        except Exception as e:
            print(f"[ERROR] Table '{t}' error: {e}")

if __name__ == "__main__":
    inspect_tables()

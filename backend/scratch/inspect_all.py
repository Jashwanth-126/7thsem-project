import os
from supabase import create_client
from dotenv import load_dotenv

script_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(script_dir, "..", ".env")
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def inspect_all_tables():
    # We can execute a raw SQL query or check schema via RPC if configured,
    # or try to check what tables we can access by querying system catalogs.
    # Supabase allows querying pg_catalog if we have service_role key. Let's see if we can do raw sql.
    # In Supabase client, there isn't a direct SQL method unless we use postgrest RPC or raw postgres client.
    # Let's check common table names to see if they exist.
    tables = [
        "retailer_inventory", "orders", "order_items", "customer_orders", 
        "cart", "cart_items", "retailers", "customers", "crops",
        "completed_auction_results", "crop_deliveries", "auction_payments"
    ]
    for t in tables:
        try:
            res = supabase.table(t).select("*").limit(1).execute()
            print(f"Table '{t}' exists.")
        except Exception as e:
            if "does not exist" in str(e):
                print(f"Table '{t}' does not exist.")
            else:
                print(f"Table '{t}' check failed with: {e}")

if __name__ == "__main__":
    inspect_all_tables()

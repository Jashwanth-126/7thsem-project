import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def check_results():
    try:
        response = supabase.table("completed_auction_results").select("*").execute()
        print(f"Total rows in completed_auction_results: {len(response.data)}")
        if response.data:
            print("First row samples:")
            print(response.data[0])
            if "winning_timestamp" in response.data[0]:
                print("Column 'winning_timestamp' exists.")
            else:
                print("Column 'winning_timestamp' DOES NOT EXIST.")
    except Exception as e:
        print(f"Error querying table: {e}")

if __name__ == "__main__":
    check_results()

import os
from supabase import create_client
from dotenv import load_dotenv

script_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(script_dir, "..", ".env")
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def check_table():
    print("Checking if traceability_history table exists...")
    try:
        res = supabase.table("traceability_history").select("*").limit(1).execute()
        print("Table 'traceability_history' exists and is accessible!")
    except Exception as e:
        print(f"Table check exception: {e}")

if __name__ == "__main__":
    check_table()

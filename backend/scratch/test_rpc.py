import os
from supabase import create_client
from dotenv import load_dotenv

script_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(script_dir, "..", ".env")
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

ddl = """
CREATE TABLE IF NOT EXISTS traceability_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
    traceability_id TEXT NOT NULL,
    performed_by TEXT,
    role TEXT NOT NULL,
    action TEXT NOT NULL,
    price DECIMAL(10, 2),
    location TEXT,
    remarks TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
"""

rpc_funcs = ["exec_sql", "execute_sql", "run_sql", "sql"]

for fn in rpc_funcs:
    try:
        res = supabase.rpc(fn, {"sql": ddl}).execute()
        print(f"RPC {fn} success: {res.data}")
        break
    except Exception as e:
        print(f"RPC {fn} error: {e}")

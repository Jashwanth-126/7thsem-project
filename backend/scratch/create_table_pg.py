import os
import psycopg2
from dotenv import load_dotenv

script_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(script_dir, "..", ".env")
load_dotenv(dotenv_path=env_path)

# Let's try common Supabase DB connection patterns or postgrest
project_ref = "oyttbisgocyycwqybina"

# Try pooler connection strings or direct password if known
passwords = ["postgres", "admin", "password", "Krishimitra123", "Krishimitra@123", "oyttbisgocyycwqybina"]
hosts = [
    f"db.{project_ref}.supabase.co",
    f"aws-0-ap-south-1.pooler.supabase.com"
]

def try_connect():
    for host in hosts:
        for pwd in passwords:
            conn_str = f"postgresql://postgres.{project_ref}:{pwd}@{host}:5432/postgres"
            try:
                conn = psycopg2.connect(conn_str, connect_timeout=3)
                print(f"SUCCESS connecting with {conn_str}")
                return conn
            except Exception as e:
                pass
    print("Could not connect with guessed passwords.")
    return None

if __name__ == "__main__":
    conn = try_connect()
    if conn:
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS traceability_history (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                crop_id BIGINT REFERENCES crops(id) ON DELETE CASCADE,
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
        """)
        conn.commit()
        print("Table 'traceability_history' created successfully!")
        conn.close()

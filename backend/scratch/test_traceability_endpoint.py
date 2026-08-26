from app import app

def test_endpoint():
    with app.test_client() as client:
        print("\n--- Testing GET /api/traceability/bb46a1a7 ---")
        res = client.get("/api/traceability/bb46a1a7")
        print("Status Code:", res.status_code)
        print("Response JSON:")
        import json
        print(json.dumps(res.get_json(), indent=2))

        print("\n--- Testing GET /api/traceability/history/bb46a1a7 ---")
        hres = client.get("/api/traceability/history/bb46a1a7")
        print("Status Code:", hres.status_code)
        print("History JSON:")
        print(json.dumps(hres.get_json(), indent=2))

if __name__ == "__main__":
    test_endpoint()

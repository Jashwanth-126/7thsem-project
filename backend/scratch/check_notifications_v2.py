import requests

def check_notifications():
    try:
        response = requests.get("http://127.0.0.1:5000/api/notifications/dealer/3")
        data = response.json()
        print(f"Count: {len(data.get('notifications', []))}")
        for n in data.get('notifications', []):
            print(f"Auction ID: {n.get('auction_id')} | Escrow Enabled: {n.get('escrow_enabled')}")
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    check_notifications()

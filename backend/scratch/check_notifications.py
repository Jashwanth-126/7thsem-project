import requests

def check_notifications():
    try:
        response = requests.get("http://127.0.0.1:5000/api/notifications/dealer/2")
        data = response.json()
        print(f"Count: {len(data.get('notifications', []))}")
        if data.get('notifications'):
            first = data['notifications'][0]
            print(f"Title: {first.get('title')}")
            print(f"Escrow Enabled: {first.get('escrow_enabled')}")
            print(f"Escrow Status: {first.get('escrow_status')}")
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    check_notifications()

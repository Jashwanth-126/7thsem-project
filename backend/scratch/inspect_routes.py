import os
import sys

script_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(script_dir, ".."))
sys.path.insert(0, backend_dir)

try:
    from app import app
    print("Flask app loaded successfully!")
    print("Verifying registered routes:")
    routes = [str(rule) for rule in app.url_map.iter_rules()]
    target_routes = [
        "/api/retailer/profile/<int:retailer_id>",
        "/api/customer/profile/<int:customer_id>",
        "/api/retailer/inventory/<int:retailer_id>",
        "/api/retailer/inventory/update-price/<uuid:inventory_id>",
        "/api/customer/nearby-retailers/<int:customer_id>",
        "/api/customer/select-retailer",
        "/api/customer/retailer-inventory/<int:retailer_id>",
        "/api/customer/order",
        "/api/customer/orders/<int:customer_id>",
        "/api/retailer/orders/<int:retailer_id>",
        "/api/retailer/order/update-status/<uuid:order_id>"
    ]
    for r in target_routes:
        exists = any(r in route for route in routes)
        print(f"Route '{r}' registered: {exists}")
except Exception as e:
    print(f"Error loading Flask app: {e}")
    sys.exit(1)

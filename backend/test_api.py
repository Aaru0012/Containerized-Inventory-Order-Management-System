import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://localhost:8000"

def make_request(path, method="GET", data=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    req_data = json.dumps(data).encode("utf-8") if data else None
    
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        try:
            parsed_error = json.loads(error_body)
        except Exception:
            parsed_error = error_body
        return e.code, parsed_error
    except Exception as e:
        print(f"Connection error: Could not reach {BASE_URL}. Ensure the API server is running.")
        sys.exit(1)

def run_tests():
    print("=" * 60)
    print("         INVENTORY & ORDER MANAGEMENT API TESTS")
    print("=" * 60)

    # 1. Health Check
    print("\n[Test 1] Health Check...")
    status, body = make_request("/")
    assert status == 200, f"Expected 200, got {status}"
    assert body["status"] == "online", "Expected online status"
    print("[OK] API is online!")

    # Clean up any pre-existing test data from previous runs if database is persistent
    _, existing_products = make_request("/products")
    for p in existing_products:
        if p["sku"] in ["TEST-SKU-001", "TEST-SKU-002"]:
            make_request(f"/products/{p['id']}", method="DELETE")
            
    _, existing_customers = make_request("/customers")
    for c in existing_customers:
        if c["email"] in ["test_alice@example.com", "test_bob@example.com"]:
            make_request(f"/customers/{c['id']}", method="DELETE")

    # 2. Create Product
    print("\n[Test 2] Create Product...")
    prod_data = {
        "name": "Test Laptop",
        "sku": "TEST-SKU-001",
        "price": 1200.50,
        "quantity": 10
    }
    status, product = make_request("/products", method="POST", data=prod_data)
    assert status == 201, f"Expected 201, got {status}"
    assert product["name"] == "Test Laptop"
    assert product["sku"] == "TEST-SKU-001"
    assert product["price"] == 1200.50
    assert product["quantity"] == 10
    prod_id = product["id"]
    print(f"[OK] Product created successfully (ID: {prod_id})")

    # 3. Create Duplicate SKU Product (Should fail)
    print("\n[Test 3] Create Duplicate SKU Product (Validation)...")
    status, error_body = make_request("/products", method="POST", data=prod_data)
    assert status == 400, f"Expected 400 Bad Request for duplicate SKU, got {status}"
    print(f"[OK] Duplicate SKU prevented! Response: {error_body['detail']}")

    # 4. Create Product with negative quantity (Should fail)
    print("\n[Test 4] Create Product with Negative Quantity (Validation)...")
    invalid_prod = {
        "name": "Invalid Product",
        "sku": "TEST-SKU-002",
        "price": 10.00,
        "quantity": -5
    }
    status, error_body = make_request("/products", method="POST", data=invalid_prod)
    assert status == 422 or status == 400, f"Expected validation error (422/400), got {status}"
    print("[OK] Negative product quantity rejected!")

    # 5. Create Customer
    print("\n[Test 5] Create Customer...")
    cust_data = {
        "name": "Test Alice",
        "email": "test_alice@example.com",
        "phone": "+1-555-0100"
    }
    status, customer = make_request("/customers", method="POST", data=cust_data)
    assert status == 201, f"Expected 201, got {status}"
    assert customer["name"] == "Test Alice"
    assert customer["email"] == "test_alice@example.com"
    cust_id = customer["id"]
    print(f"[OK] Customer created successfully (ID: {cust_id})")

    # 6. Create Duplicate Email Customer (Should fail)
    print("\n[Test 6] Create Duplicate Email Customer (Validation)...")
    status, error_body = make_request("/customers", method="POST", data=cust_data)
    assert status == 400, f"Expected 400, got {status}"
    print(f"[OK] Duplicate email prevented! Response: {error_body['detail']}")

    # 7. Place Order (Should succeed and reduce stock)
    print("\n[Test 7] Create Order (Fulfillment & Automatic Calculations)...")
    order_data = {
        "customer_id": cust_id,
        "items": [
            {
                "product_id": prod_id,
                "quantity": 3
            }
        ]
    }
    status, order = make_request("/orders", method="POST", data=order_data)
    assert status == 201, f"Expected 201, got {status}"
    assert order["customer_id"] == cust_id
    assert len(order["items"]) == 1
    assert order["items"][0]["quantity"] == 3
    # Check automatic calculation of total: 3 * 1200.50 = 3601.50
    assert order["total_amount"] == 3601.50, f"Expected total 3601.50, got {order['total_amount']}"
    order_id = order["id"]
    print(f"[OK] Order #{order_id} placed! Total amount (${order['total_amount']}) calculated automatically.")

    # 8. Check stock levels after order
    print("\n[Test 8] Checking Inventory Levels post-order...")
    status, product_after = make_request(f"/products/{prod_id}")
    assert product_after["quantity"] == 7, f"Expected stock 7, got {product_after['quantity']}"
    print("[OK] Stock level reduced correctly from 10 to 7!")

    # 9. Place Order with insufficient stock (Should fail)
    print("\n[Test 9] Create Order with Insufficient Stock (Transaction Safety)...")
    insufficient_order_data = {
        "customer_id": cust_id,
        "items": [
            {
                "product_id": prod_id,
                "quantity": 8  # Only 7 left
            }
        ]
    }
    status, error_body = make_request("/orders", method="POST", data=insufficient_order_data)
    assert status == 400, f"Expected 400 Bad Request, got {status}"
    print(f"[OK] Insufficient stock order rejected! Response: {error_body['detail']}")

    # 10. Check stock level remains unchanged
    status, product_after_failed = make_request(f"/products/{prod_id}")
    assert product_after_failed["quantity"] == 7, "Stock level should remain 7"
    print("[OK] Stock level was preserved (transaction safety active)!")

    # 11. Delete/Cancel Order (Should restore stock)
    print("\n[Test 11] Cancel Order (Restore stock)...")
    status, cancelled_order = make_request(f"/orders/{order_id}", method="DELETE")
    assert status == 200, f"Expected 200, got {status}"
    
    # Check if stock restored
    status, product_restored = make_request(f"/products/{prod_id}")
    assert product_restored["quantity"] == 10, f"Expected restored stock to be 10, got {product_restored['quantity']}"
    print("[OK] Order cancelled. Stock restored to 10 successfully!")

    # Clean up test resources
    print("\nCleaning up test resources...")
    make_request(f"/customers/{cust_id}", method="DELETE")
    make_request(f"/products/{prod_id}", method="DELETE")
    print("[OK] Cleanup finished!")
    
    print("\n" + "=" * 60)
    print(" SUCCESS: ALL API SYSTEM INTEGRATION TESTS PASSED!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()

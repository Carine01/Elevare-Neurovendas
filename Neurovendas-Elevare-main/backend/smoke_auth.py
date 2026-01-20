#!/usr/bin/env python3
"""
Local smoke test for auth/health endpoints on the monolithic server.
Runs against http://127.0.0.1:8001 by default.
"""
import os
import sys
import json
import time
import requests

BASE = os.environ.get("BASE_URL", "http://127.0.0.1:8001")

def log(title, data):
    print(f"\n=== {title} ===")
    if isinstance(data, (dict, list)):
        print(json.dumps(data, indent=2, ensure_ascii=False))
    else:
        print(str(data))

def main():
    # Health
    try:
        r = requests.get(f"{BASE}/api/health", timeout=5)
        log("Health", {"status_code": r.status_code, "body": r.json() if r.headers.get("content-type","" ).startswith("application/json") else r.text})
        if r.status_code != 200:
            print("Health check failed.")
            sys.exit(1)
    except Exception as e:
        print(f"Health error: {e}")
        sys.exit(1)

    # Create beta in memory
    try:
        r = requests.post(f"{BASE}/api/auth/mock-create-beta", timeout=10)
        if r.status_code != 200:
            log("Create Beta (error)", {"status_code": r.status_code, "text": r.text})
            sys.exit(1)
        data = r.json()
        token = data.get("access_token")
        user = data.get("user")
        log("Create Beta (ok)", {"token_preview": token[:32] + "..." if token else None, "user": user})
        if not token:
            print("No token returned.")
            sys.exit(1)
    except Exception as e:
        print(f"Create beta error: {e}")
        sys.exit(1)

    # /me
    try:
        headers = {"Authorization": f"Bearer {token}"}
        r = requests.get(f"{BASE}/api/auth/me", headers=headers, timeout=10)
        log("Auth Me", {"status_code": r.status_code, "body": r.json() if r.headers.get("content-type","" ).startswith("application/json") else r.text})
        if r.status_code != 200:
            print("Auth me failed.")
            sys.exit(1)
    except Exception as e:
        print(f"Auth me error: {e}")
        sys.exit(1)

    print("\n✅ Smoke auth passed.")

if __name__ == "__main__":
    main()

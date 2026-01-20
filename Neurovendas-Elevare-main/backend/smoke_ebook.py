#!/usr/bin/env python3
"""
Local smoke test for Ebook V2 generation.
Assumes server is running at BASE_URL (default http://127.0.0.1:8001).
"""
import os
import sys
import json
import requests

BASE = os.environ.get("BASE_URL", "http://127.0.0.1:8001")

def log(title, data):
    print(f"\n=== {title} ===")
    if isinstance(data, (dict, list)):
        print(json.dumps(data, indent=2, ensure_ascii=False))
    else:
        print(str(data))

PAYLOAD = {
    "title": "Guia Rápido",
    "topic": "Marketing de Estética",
    "audience": "Dermatos e esteticistas",
    "tone": "profissional",
    "num_chapters": 3
}

def main():
    # Health
    r = requests.get(f"{BASE}/api/health", timeout=10)
    log("Health", {"status_code": r.status_code, "body": r.json() if r.headers.get("content-type","" ).startswith("application/json") else r.text})
    if r.status_code != 200:
        print("Health failed.")
        sys.exit(1)

    # Token via mock-create-beta
    r = requests.post(f"{BASE}/api/auth/mock-create-beta", timeout=15)
    if r.status_code != 200:
        log("Create Beta (error)", {"status_code": r.status_code, "text": r.text})
        sys.exit(1)
    token = r.json().get("access_token")
    if not token:
        print("No token returned.")
        sys.exit(1)

    # Generate Ebook V2 (long timeout)
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    r = requests.post(f"{BASE}/api/ebook/generate-v2", headers=headers, json=PAYLOAD, timeout=180)
    content_type = r.headers.get("content-type", "")
    body = r.json() if content_type.startswith("application/json") else r.text
    log("Ebook V2 Response", {"status_code": r.status_code, "body": body})

    if r.status_code != 200:
        print("Ebook V2 generation failed.")
        sys.exit(1)

    print("\n✅ Smoke ebook v2 passed.")

if __name__ == "__main__":
    main()

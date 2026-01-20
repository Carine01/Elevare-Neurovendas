import os
import requests
import pytest

BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:8001")

@pytest.fixture(scope="session")
def base_url():
    return BASE_URL

@pytest.fixture(scope="session")
def token(base_url):
    r = requests.post(f"{base_url}/api/auth/mock-create-beta", timeout=10)
    assert r.status_code == 200, f"mock-create-beta failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data, f"No access_token in response: {data}"
    return data["access_token"]

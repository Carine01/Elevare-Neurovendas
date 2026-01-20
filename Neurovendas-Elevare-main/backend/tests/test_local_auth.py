import requests

def test_health(base_url):
    r = requests.get(f"{base_url}/api/health", timeout=5)
    assert r.status_code == 200
    body = r.json()
    assert body.get("status") == "healthy"


def test_auth_me(base_url, token):
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get(f"{base_url}/api/auth/me", headers=headers, timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert data.get("email") == "beta@elevare.com"
    assert "plan" in data
    assert "credits_remaining" in data

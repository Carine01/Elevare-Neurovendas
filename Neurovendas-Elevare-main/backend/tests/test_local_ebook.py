import os
import requests

PAYLOAD = {
    "title": "Guia Rápido",
    "topic": "Marketing de Estética",
    "audience": "Dermatos e esteticistas",
    "tone": "profissional",
    "num_chapters": 3
}

def test_ebook_v2(base_url, token):
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    r = requests.post(f"{base_url}/api/ebook/generate-v2", headers=headers, json=PAYLOAD, timeout=180)
    assert r.status_code == 200
    ct = r.headers.get("content-type", "")
    # Accept JSON or text response; basic shape check
    if ct.startswith("application/json"):
        data = r.json()
        assert "success" in data or "ebook" in data or "message" in data
    else:
        text = r.text
        assert len(text) > 0

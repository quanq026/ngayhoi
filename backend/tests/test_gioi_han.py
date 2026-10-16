# Khung đầu tệp backend/tests/test_gioi_han.py — giữ nguyên thứ tự dòng
import os
os.environ["DB_PATH"] = ":memory:"   # phải đặt TRƯỚC khi import main
import pytest
from fastapi.testclient import TestClient
import main

client = TestClient(main.app)

@pytest.fixture(autouse=True)
def so_trong():
    main.db.execute("DELETE FROM dang_ky"); main.db.commit()

def lap_day(ma_phien, n):
    for i in range(n):
        client.post("/api/dang-ky", json={"ma_sv": f"SV{i:03}", "ma_phien": ma_phien})

# Viết 5 test, mỗi test ứng một dòng 1–5 của spec.md
def test_dong_1_p01_trong():
    res = client.post("/api/dang-ky", json={"ma_sv": "SV001", "ma_phien": "P01"})
    assert res.status_code == 201

def test_dong_2_p01_co_29():
    lap_day("P01", 29)
    res = client.post("/api/dang-ky", json={"ma_sv": "SV_MOI", "ma_phien": "P01"})
    assert res.status_code == 201

def test_dong_3_p01_co_30():
    lap_day("P01", 30)
    res = client.post("/api/dang-ky", json={"ma_sv": "SV_MOI", "ma_phien": "P01"})
    assert res.status_code == 409
    assert res.json().get("detail") == "HET_CHO"

def test_dong_4_sv000_dang_ky_lai():
    lap_day("P01", 30)
    res = client.post("/api/dang-ky", json={"ma_sv": "SV000", "ma_phien": "P01"})
    assert res.status_code == 409
    assert res.json().get("detail") == "DA_DANG_KY"

def test_dong_5_p01_day_dang_ky_p02():
    lap_day("P01", 30)
    res = client.post("/api/dang-ky", json={"ma_sv": "SV031", "ma_phien": "P02"})
    assert res.status_code == 201

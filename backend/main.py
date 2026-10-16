from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import os
import threading

SUC_CHUA = 30
DB_PATH = os.environ.get("DB_PATH", "ngayhoi.db")
db = sqlite3.connect(DB_PATH, check_same_thread=False)
db_lock = threading.Lock()
db.execute("""CREATE TABLE IF NOT EXISTS dang_ky(
  ma_sv TEXT, ma_phien TEXT, UNIQUE(ma_sv, ma_phien))""")

app = FastAPI()
app.add_middleware(CORSMiddleware,
    allow_origins=["http://localhost:5173"], allow_methods=["*"], allow_headers=["*"])

class DangKy(BaseModel):
    ma_sv: str
    ma_phien: str

@app.post("/api/dang-ky", status_code=201)
def dang_ky(d: DangKy):
    with db_lock:
        # Kiểm tra trùng lặp sinh viên trước
        r = db.execute("SELECT 1 FROM dang_ky WHERE ma_sv=? AND ma_phien=?", (d.ma_sv, d.ma_phien)).fetchone()
        if r:
            raise HTTPException(409, "DA_DANG_KY")

        # Đếm và ghi trong một câu lệnh duy nhất (atomic)
        cur = db.execute("""
            INSERT INTO dang_ky(ma_sv, ma_phien)
            SELECT ?, ?
            WHERE (SELECT COUNT(*) FROM dang_ky WHERE ma_phien = ?) < ?
        """, (d.ma_sv, d.ma_phien, d.ma_phien, SUC_CHUA))
        db.commit()

        if cur.rowcount == 0:
            raise HTTPException(409, "HET_CHO")
        return {"ok": True}

@app.get("/api/con-cho")
def lay_con_cho(ma_phien: str):
    with db_lock:
        r = db.execute("SELECT COUNT(*) FROM dang_ky WHERE ma_phien = ?", (ma_phien,)).fetchone()
        da_co = r[0] if r else 0
        return {"con_cho": max(0, SUC_CHUA - da_co)}

import sqlite3
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Khởi tạo cơ sở dữ liệu SQLite
conn = sqlite3.connect("ngayhoi.db")
cursor = conn.cursor()
cursor.execute("""
CREATE TABLE IF NOT EXISTS dang_ky (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ma_sv TEXT NOT NULL,
    ma_phien TEXT NOT NULL,
    UNIQUE(ma_sv, ma_phien)
)
""")
conn.commit()
conn.close()

app = FastAPI(title="Dang ky Ngay hoi")

# CORS: chỉ cho phép duy nhất địa chỉ của frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DangKy(BaseModel):
    ma_sv: str
    ma_phien: str

@app.post("/api/dang-ky", status_code=status.HTTP_201_CREATED)
def dang_ky(data: DangKy):
    try:
        with sqlite3.connect("ngayhoi.db") as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO dang_ky (ma_sv, ma_phien) VALUES (?, ?)",
                (data.ma_sv, data.ma_phien),
            )
            conn.commit()
        return {"ok": True}
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="DA_DANG_KY",
        )

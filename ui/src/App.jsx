import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, Send, RefreshCw, Calendar, User, Clock, ShieldCheck } from "lucide-react";
import "./App.css";

function App() {
  const [maSv, setMaSv] = useState("");
  const [maPhien, setMaPhien] = useState("P01");
  const [loading, setLoading] = useState(false);
  const [statusState, setStatusState] = useState("IDLE"); // 'IDLE' | 'SUCCESS' | 'CONFLICT' | 'ERROR'
  const [responseDetails, setResponseDetails] = useState(null);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!maSv.trim() || !maPhien.trim()) {
      alert("Vui lòng nhập đầy đủ Mã sinh viên và Mã phiên!");
      return;
    }

    setLoading(true);
    setStatusState("LOADING");
    setResponseDetails(null);

    try {
      const res = await fetch("http://localhost:8000/api/dang-ky", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ma_sv: maSv.trim(),
          ma_phien: maPhien.trim(),
        }),
      });

      const data = await res.json();

      if (res.status === 201) {
        setStatusState("SUCCESS");
        setResponseDetails({
          code: 201,
          statusText: "201 Created",
          message: "Đăng ký thành công!",
          raw: data,
        });
      } else if (res.status === 409) {
        setStatusState("CONFLICT");
        setResponseDetails({
          code: 409,
          statusText: "409 Conflict",
          message: data.detail === "DA_DANG_KY" 
            ? "Mã sinh viên đã đăng ký phiên này trước đó (Lỗi DA_DANG_KY)!" 
            : "Đăng ký trùng lặp!",
          raw: data,
        });
      } else if (res.status === 422) {
        setStatusState("ERROR");
        setResponseDetails({
          code: 422,
          statusText: "422 Unprocessable Entity",
          message: "Dữ liệu không hợp lệ hoặc thiếu trường bắt buộc!",
          raw: data,
        });
      } else {
        setStatusState("ERROR");
        setResponseDetails({
          code: res.status,
          statusText: `Lỗi ${res.status}`,
          message: data.detail || "Đã xảy ra lỗi không xác định",
          raw: data,
        });
      }
    } catch (err) {
      setStatusState("ERROR");
      setResponseDetails({
        code: 0,
        statusText: "Lỗi kết nối",
        message: "Không thể kết nối đến máy chủ FastAPI (http://localhost:8000). Vui lòng kiểm tra lại server!",
        raw: { error: err.message },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setMaSv("22020001");
    setMaPhien("P01");
  };

  const handleResetForm = () => {
    setMaSv("");
    setMaPhien("P01");
    setStatusState("IDLE");
    setResponseDetails(null);
  };

  return (
    <div className="container">
      <header className="header">
        <div className="badge">CSE3051 · BUỔI 3 THỰC HÀNH</div>
        <h1>Hệ Thống Đăng Ký Phiên Ngày Hội</h1>
        <p className="subtitle">
          Ứng dụng kết nối FastAPI Backend & Cơ sở dữ liệu SQLite có ràng buộc UNIQUE
        </p>
      </header>

      <main className="main-content">
        <div className="card form-card">
          <div className="card-header">
            <h2>
              <Calendar className="icon" /> Thông tin đăng ký
            </h2>
            <button 
              type="button" 
              className="btn-demo" 
              onClick={handleFillDemo} 
              title="Điền dữ liệu mẫu theo Slide (22020001 - P01)"
            >
              Dữ liệu mẫu Slide
            </button>
          </div>

          <form onSubmit={handleSubmit} className="registration-form">
            <div className="form-group">
              <label htmlFor="ma_sv">
                <User size={16} /> Mã sinh viên (ma_sv):
              </label>
              <input
                id="ma_sv"
                type="text"
                placeholder="VD: 22020001 hoặc 24110262"
                value={maSv}
                onChange={(e) => setMaSv(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="ma_phien">
                <Clock size={16} /> Mã phiên ngày hội (ma_phien):
              </label>
              <select
                id="ma_phien"
                value={maPhien}
                onChange={(e) => setMaPhien(e.target.value)}
              >
                <option value="P01">Phiên P01 - Khai mạc & Giới thiệu AI</option>
                <option value="P02">Phiên P02 - Thực hành Prompt Engineering</option>
                <option value="P03">Phiên P03 - Xây dựng Ứng dụng Fullstack</option>
                <option value="P04">Phiên P04 - Bế mạc & Trao giải</option>
              </select>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="spin" size={16} /> Đang xử lý...
                  </>
                ) : (
                  <>
                    <Send size={16} /> Đăng ký tham gia
                  </>
                )}
              </button>

              <button 
                type="button" 
                className="btn-secondary" 
                onClick={handleResetForm}
              >
                Làm mới
              </button>
            </div>
          </form>
        </div>

        {/* Khu vực hiển thị Trạng thái */}
        <div className="card status-card">
          <div className="card-header">
            <h2>
              <ShieldCheck className="icon" /> Trạng thái phản hồi từ API
            </h2>
          </div>

          {/* TRẠNG THÁI 1: IDLE / SẴN SÀNG */}
          {statusState === "IDLE" && (
            <div className="status-box idle">
              <div className="status-header">
                <span className="dot dot-idle"></span>
                <h3>Trạng thái 1: Sẵn sàng gửi dữ liệu</h3>
              </div>
              <p>
                Form đang ở trạng thái ban đầu. Hãy nhập Mã sinh viên và chọn Mã phiên, sau đó nhấn nút <strong>"Đăng ký tham gia"</strong>.
              </p>
              <div className="hint-box">
                <strong>Mẹo kiểm thử theo tiêu chí Xuất sắc:</strong>
                <ul>
                  <li>Nhấn nút <em>"Dữ liệu mẫu Slide"</em> để điền `22020001` và `P01`.</li>
                  <li>Bấm đăng ký lần 1 ➔ Kiểm tra phản hồi <strong>201 Created</strong>.</li>
                  <li>Bấm đăng ký lần 2 (giữ nguyên dữ liệu) ➔ Kiểm tra phản hồi <strong>409 Conflict</strong>.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TRẠNG THÁI ĐANG GỬI */}
          {statusState === "LOADING" && (
            <div className="status-box loading">
              <RefreshCw className="spin status-icon" size={32} />
              <h3>Đang gửi yêu cầu tới FastAPI...</h3>
              <p>Đang gửi POST tới http://localhost:8000/api/dang-ky</p>
            </div>
          )}

          {/* TRẠNG THÁI 2: 201 CREATED (THÀNH CÔNG) */}
          {statusState === "SUCCESS" && responseDetails && (
            <div className="status-box success">
              <div className="status-header">
                <CheckCircle2 className="status-icon text-success" size={28} />
                <div>
                  <span className="badge badge-success">Mã HTTP: 201 Created</span>
                  <h3>Trạng thái 2: Đăng ký thành công!</h3>
                </div>
              </div>
              <p className="status-message">
                Đã ghi nhận thông tin đăng ký vào cơ sở dữ liệu `ngayhoi.db`.
              </p>
              <div className="info-summary">
                <div><strong>Mã SV:</strong> {maSv}</div>
                <div><strong>Mã phiên:</strong> {maPhien}</div>
              </div>
              <div className="json-preview">
                <span className="json-label">API Response Payload:</span>
                <pre>{JSON.stringify(responseDetails.raw, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* TRẠNG THÁI 3: 409 CONFLICT (ĐÃ ĐĂNG KÝ / TRÙNG LẶP) */}
          {statusState === "CONFLICT" && responseDetails && (
            <div className="status-box conflict">
              <div className="status-header">
                <AlertTriangle className="status-icon text-danger" size={28} />
                <div>
                  <span className="badge badge-danger">Mã HTTP: 409 Conflict</span>
                  <h3>Trạng thái 3: Trùng lặp (DA_DANG_KY)</h3>
                </div>
              </div>
              <p className="status-message">
                <strong>{responseDetails.message}</strong>
              </p>
              <p className="explanation">
                Ràng buộc <code>UNIQUE(ma_sv, ma_phien)</code> trong bảng <code>dang_ky</code> của SQLite đã hoạt động chính xác để ngăn chặn sinh viên đăng ký hai lần vào cùng một phiên.
              </p>
              <div className="json-preview">
                <span className="json-label">API Response Payload:</span>
                <pre>{JSON.stringify(responseDetails.raw, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* TRẠNG THÁI LỖI KHÁC NẾU CÓ */}
          {statusState === "ERROR" && responseDetails && (
            <div className="status-box error">
              <div className="status-header">
                <AlertTriangle className="status-icon text-warning" size={28} />
                <div>
                  <span className="badge badge-warning">HTTP {responseDetails.code}</span>
                  <h3>Có lỗi xảy ra</h3>
                </div>
              </div>
              <p className="status-message">{responseDetails.message}</p>
              <div className="json-preview">
                <pre>{JSON.stringify(responseDetails.raw, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>CSE3051 - Các công cụ trong AI | B3_24110262 - Trần Quân</p>
      </footer>
    </div>
  );
}

export default App;

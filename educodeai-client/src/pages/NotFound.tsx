import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="container-fluid vh-100 d-flex flex-column justify-content-center align-items-center bg-light">
      <div className="text-center p-5 shadow bg-white rounded-4" style={{ maxWidth: '500px' }}>
        <h1 className="display-1 fw-bold text-primary" style={{ color: '#fb873f !important' }}>404</h1>
        <h2 className="mb-4 fw-bold">Trang không tồn tại</h2>
        <p className="text-muted mb-4">
          Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển. 
          Vui lòng quay lại trang chủ.
        </p>
        <Link to="/" className="btn btn-primary btn-lg rounded-pill px-5 text-white border-0 fw-bold" style={{ backgroundColor: '#fb873f' }}>
           Về Trang Chủ
        </Link>
      </div>
      <div className="mt-4 text-muted small">
        © 2026 EduCodeAI - Nền tảng học lập trình thông minh
      </div>
    </div>
  );
};

export default NotFound;

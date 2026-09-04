import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axiosClient from '@/configs/axios';

interface Certificate {
  hopLe: boolean;
  maChungChi: string;
  hoTen: string;
  tenKhoaHoc: string;
  tenChungChi?: string | null;
  ngayCap: string;
}

export default function XacNhanChungChi() {
  const [params] = useSearchParams();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [error, setError] = useState('');
  const ma = params.get('ma')?.trim() || '';

  useEffect(() => {
    if (!ma) {
      setError('Thiếu mã chứng chỉ.');
      return;
    }
    axiosClient.get<Certificate>(`/api/chung-chi/xac-nhan?ma=${encodeURIComponent(ma)}`)
      .then(setCertificate)
      .catch((e) => setError(e?.response?.data?.thongBao || 'Không tìm thấy chứng chỉ.'));
  }, [ma]);

  return (
    <main style={{ minHeight: '100vh', background: '#f6f3ed', padding: '48px 16px', display: 'flex', justifyContent: 'center' }}>
      <section style={{ width: '100%', maxWidth: 680, background: '#fffdf7', border: '8px solid #d8b44c', padding: '42px 32px', textAlign: 'center', color: '#1a2b4a', boxShadow: '0 8px 28px #0002' }}>
        <div style={{ fontSize: 14, letterSpacing: 4, color: '#9b7412', fontWeight: 700 }}>EDUCODEAI</div>
        <h1 style={{ fontFamily: 'serif', fontSize: 42, margin: '18px 0 8px' }}>Xác minh chứng chỉ</h1>
        {error ? (
          <>
            <div style={{ fontSize: 56, color: '#c0392b', margin: 20 }}>×</div>
            <h2>Chứng chỉ không hợp lệ</h2>
            <p style={{ color: '#666' }}>{error}</p>
          </>
        ) : !certificate ? (
          <p>Đang kiểm tra chứng chỉ...</p>
        ) : (
          <>
            <div style={{ fontSize: 52, color: '#b28a16', margin: 12 }}>✓</div>
            <h2 style={{ color: '#9b7412' }}>Chứng chỉ hợp lệ</h2>
            <p style={{ fontSize: 18 }}>Chứng nhận được cấp cho</p>
            <h3 style={{ fontSize: 32, margin: '8px 0 24px' }}>{certificate.hoTen}</h3>
            <p>Đã hoàn thành khóa học</p>
            <h2 style={{ margin: '8px 0 24px' }}>{certificate.tenKhoaHoc}</h2>
            <div style={{ borderTop: '1px solid #d8b44c', paddingTop: 18, display: 'grid', gap: 8 }}>
              <div><strong>Mã chứng chỉ:</strong> {certificate.maChungChi}</div>
              <div><strong>Ngày cấp:</strong> {new Date(certificate.ngayCap).toLocaleDateString('vi-VN')}</div>
            </div>
          </>
        )}
        <Link to="/" style={{ display: 'inline-block', marginTop: 28, color: '#fff', background: '#f69050', padding: '10px 24px', borderRadius: 24, textDecoration: 'none' }}>Về trang chủ</Link>
      </section>
    </main>
  );
}

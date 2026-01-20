import React, { useState, useEffect, useMemo } from 'react';

import '@/pages/hoc-vien/noi-dung-khoa-hoc/style.css';
import { KhoaHocService } from '@/services/khoa-hoc.service';
import type { KhoaHocData } from '@/pages/hoc-vien/noi-dung-khoa-hoc/NoiDungKhoaHocDTO';

// 3. Import các Component con (Lưu ý đường dẫn thư mục 'CacThanhPhan')
import { ThanhTieuDe } from '@/pages/hoc-vien/noi-dung-khoa-hoc/components/ThanhTieuDe';
// import { DanhSachBaiHoc } from './CacThanhPhan/DanhSachBaiHoc';
// import { NoiDungVideo } from './CacThanhPhan/NoiDungVideo';
// import { NoiDungLyThuyet } from './CacThanhPhan/NoiDungLyThuyet';
// import { BaiTapThucHanh } from './CacThanhPhan/BaiTapThucHanh';
// import { BaiTapTracNghiem } from './CacThanhPhan/BaiTapTracNghiem';
// import { DieuHuongNhanh } from './CacThanhPhan/DieuHuongNhanh';

const NoiDungKhoaHoc: React.FC = () => {
  // --- STATE QUẢN LÝ DỮ LIỆU & UI ---
  const [duLieu, setDuLieu] = useState<KhoaHocData | null>(null);
  const [dangTai, setDangTai] = useState<boolean>(true);
  const [loi, setLoi] = useState<string | null>(null);

  const [idBaiHoc, setIdBaiHoc] = useState<number>(0);

  useEffect(() => {
    const taiDuLieu = async () => {
      try {
        setDangTai(true);
        const data = await KhoaHocService.layDuLieuKhoaHoc(7);
        
        setDuLieu(data);
        // if (data.cacChuong.length > 0 && data.cacChuong[0].baiHocs.length > 0) {
        //   setIdBaiHoc(data.cacChuong[0].baiHocs[0].id);
        // }
      } catch (err) {
        console.error(err);
        setLoi("Không thể tải khóa học. Vui lòng kiểm tra kết nối mạng.");
      } finally {
        setDangTai(false);
      }
    };

    taiDuLieu();
  }, []);

  // const dsBaiHocPhang = useMemo(() => 
  //   duLieu ? KhoaHocService.layDanhSachBaiHocPhang(duLieu.cacChuong) : [], 
  // [duLieu]);

  // const baiHocHienTai = KhoaHocService.timBaiHoc(dsBaiHocPhang, idBaiHoc);
  // const idTiep = KhoaHocService.layIdTiepTheo(dsBaiHocPhang, idBaiHoc);
  // const idTruoc = KhoaHocService.layIdTruoc(dsBaiHocPhang, idBaiHoc);

  // // 3. Tính % tiến độ (Logic đơn giản dựa trên vị trí bài học)
  // const indexHienTai = dsBaiHocPhang.findIndex(b => b.id === idBaiHoc);
  // const tienDo = dsBaiHocPhang.length > 0 
  //   ? Math.round(((indexHienTai + 1) / dsBaiHocPhang.length) * 100) 
  //   : 0;

  // const handleNext = () => {
  //     if (idTiep) setIdBaiHoc(idTiep);
  // };

  // const handlePrev = () => {
  //     if (idTruoc) setIdBaiHoc(idTruoc);
  // };

  if (dangTai) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#f4f5fb' }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '3rem', color: '#f69050' }}></i>
          <p style={{ marginTop: '1rem', color: '#666', fontFamily: 'sans-serif' }}>Đang tải nội dung khóa học...</p>
        </div>
      </div>
    );
  }

  // --- RENDER 2: MÀN HÌNH LỖI ---
  // if (loi || !duLieu || !baiHocHienTai) {
  //   return (
  //       <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626', fontFamily: 'sans-serif' }}>
  //           <h2>Đã xảy ra lỗi!</h2>
  //           <p>{loi || "Không tìm thấy dữ liệu bài học."}</p>
  //           <button onClick={() => window.location.reload()} style={{ padding: '8px 16px', marginTop: '10px', cursor: 'pointer' }}>Thử lại</button>
  //       </div>
  //   );
  // }

  return (
    
    <div className="trinh-phat-wrapper">

      <ThanhTieuDe tenKhoaHoc={duLieu!.tenKhoaHoc} tienDo={1} />

      {/* <main className="cp-shell">
        <section className="cp-left">
          {baiHocHienTai.loai === 'video' && (
             <NoiDungVideo link={baiHocHienTai.linkVideo} />
          )}
          
          {baiHocHienTai.loai === 'van-ban' && (
             <NoiDungLyThuyet tieuDe={baiHocHienTai.tieuDe} noiDung={baiHocHienTai.noiDungChu} />
          )}
          
          {baiHocHienTai.loai === 'thuc-hanh' && (
             <BaiTapThucHanh baiHoc={baiHocHienTai} />
          )}
          
          {baiHocHienTai.loai === 'trac-nghiem' && (
             <BaiTapTracNghiem baiHoc={baiHocHienTai} />
          )}
        </section>

        <DanhSachBaiHoc 
          cacChuong={duLieu.cacChuong} 
          idHienTai={idBaiHoc} 
          onChonBai={setIdBaiHoc} 
        />
      </main> */}
      {/* 
      <DieuHuongNhanh 
        onNext={handleNext} 
        onPrev={handlePrev} 
        voHieuHoaNext={!idTiep}
        voHieuHoaPrev={!idTruoc}
      /> */}
    </div>
  );
};

export default NoiDungKhoaHoc;
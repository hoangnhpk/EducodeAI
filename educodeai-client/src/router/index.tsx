import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HoSoHocVienPage from "../pages/hoc-vien/ho-so-hoc-vien/ho-so-hoc-vien";
import LayoutHocVien from "../layouts/hoc-vien/LayoutHocVien";
import LayoutBlank from "../layouts/hoc-vien/LayoutBlank";
import LayoutGiangVien from "../layouts/giang-vien/LayoutGiangVien";
import LayoutQuanTriVien from "../layouts/quan-tri-vien/LayoutQuanTriVien";

// /* ===== AUTH ===== */
import DangNhap from "../pages/auth/DangNhap";
import DangKy from "../pages/auth/DangKy";
import QuenMatKhau from "../pages/auth/QuenMatKhau";

// /* ===== HỌC VIÊN ===== */
// import TrangChuHocVien from "@/pages/hoc-vien/trang-chu/TrangChu";
import NoiDungKhoaHoc from "@/pages/hoc-vien/noi-dung-khoa-hoc/NoiDungKhoaHoc";
// import ChiTietKhoaHoc from "../pages/hoc-vien/chi-tiet-khoa-hoc/ChiTietKhoaHoc";
// import NoiDungBaiHoc from "../pages/hoc-vien/noi-dung-bai-hoc/NoiDungBaiHoc";
// import IDEAI from "../pages/hoc-vien/thuc-hanh-ide-ai/IDEAI";
// import LichSuBaiLam from "../pages/hoc-vien/lich-su-bai-lam/LichSuLamBai";
import YeuCauLoTrinhAI from "../pages/hoc-vien/yeu-cau-lo-trinh-ai/YeuCauLoTrinhAI";
// import KhoaHocAICuaToi from "../pages/hoc-vien/khoa-hoc-ca-nhan-ai/KhoaHocCaNhanAI";
// import TroLyAI from "../pages/hoc-vien/tro-ly-hoi-dap-ai/TroLyAI";

// /* ===== GIẢNG VIÊN ===== */
// import GVDashboard from "../pages/giang-vien/dashboard-giang-vien/Dashboard";
// import KhoaHocCuaToi from "../pages/giang-vien/khoa-hoc-cua-toi/KhoaHocCuaToi";
// import QuanLyGiaoTrinh from "../pages/giang-vien/quan-ly-giao-trinh/QuanLyGiaoTrinh";
// import TaoBaiTap from "../pages/giang-vien/tao-bai-tap-test-case/TaoBaiTap";
// import ThongKeHocTap from "../pages/giang-vien/thong-ke-hoc-tap/ThongKeHocTap";

// /* ===== ADMIN ===== */
// import ADashboard from "../pages/quan-tri-vien/dashboard-he-thong/Dashboard";
// import QuanLyNguoiDung from "../pages/quan-tri-vien/quan-ly-nguoi-dung/QuanLyNguoiDung";
// import QuanLyReview from "../pages/quan-tri-vien/quan-ly-binh-luan-review/QuanLyReview";
// import CauHinhHeThong from "../pages/quan-tri-vien/cau-hinh-he-thong/CauHinhHeThong";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dang-nhap" element={<DangNhap />} />
        <Route path="/dang-ky" element={<DangKy />} />
        <Route path="/quen-mat-khau" element={<QuenMatKhau />} /> 

        {/* HỌC VIÊN */}
        <Route path="/" element={<LayoutHocVien />}>
          {/* <Route index element={<TrangChuHocVien />} /> */}
          {/* <Route path="khoa-hoc/:id" element={<ChiTietKhoaHoc />} />
          <Route path="bai-hoc/:lessonId" element={<NoiDungBaiHoc />} />
          <Route path="ide-ai" element={<IDEAI />} />
          <Route path="lich-su-bai-lam" element={<LichSuBaiLam />} /> */}
          <Route path="yeu-cau-lo-trinh-ai" element={<YeuCauLoTrinhAI />} />
          {/* <Route path="khoa-hoc-ai-cua-toi" element={<KhoaHocAICuaToi />} />
          <Route path="tro-ly-ai" element={<TroLyAI />} /> */}
        </Route>
        {/* Trang nội dung khóa học không sử dụng layout có header và footer */}
        <Route element={<LayoutBlank />}>
          <Route path="khoa-hoc/:slug/:id" element={<NoiDungKhoaHoc />} />
        </Route>

        {/* GIẢNG VIÊN */}
        <Route path="/giang-vien" element={<LayoutGiangVien />}>
          {/* <Route index element={<GVDashboard />} />
          <Route path="khoa-hoc-cua-toi" element={<KhoaHocCuaToi />} />
          <Route path="giao-trinh" element={<QuanLyGiaoTrinh />} />
          <Route path="bai-tap" element={<TaoBaiTap />} />
          <Route path="thong-ke" element={<ThongKeHocTap />} /> */}
        </Route>

        {/* ADMIN */}
        <Route path="/quan-tri-vien" element={<LayoutQuanTriVien />}>
          {/* <Route index element={<ADashboard />} />
          <Route path="nguoi-dung" element={<QuanLyNguoiDung />} />
          <Route path="review" element={<QuanLyReview />} />
          <Route path="cau-hinh" element={<CauHinhHeThong />} /> */}
        </Route>
        <Route path="/hoc-vien" element={<LayoutHocVien />}>
          <Route path="ho-so" element={<HoSoHocVienPage />} />
        </Route>
        {/* FALLBACK */}
        {/* <Route path="*" element={<Navigate to="/dang-nhap" replace />} /> */}

      </Routes>
    </BrowserRouter>
  );
}

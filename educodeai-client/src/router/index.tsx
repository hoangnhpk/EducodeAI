import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../pages/auth/ProtectedRoute"; // Đảm bảo đúng đường dẫn file này

import LayoutHocVien from "../layouts/hoc-vien/LayoutHocVien";
import LayoutBlank from "../layouts/hoc-vien/LayoutBlank";
import LayoutGiangVien from "../layouts/giang-vien/LayoutGiangVien";
import LayoutQuanTriVien from "../layouts/quan-tri-vien/LayoutQuanTriVien";

// /* ===== AUTH ===== */
import DangNhap from "../pages/auth/DangNhap";
import DangKy from "../pages/auth/DangKy";
import QuenMatKhau from "../pages/auth/QuenMatKhau";

// /* ===== HỌC VIÊN ===== */
import TrangChuHocVien from "@/pages/hoc-vien/trang-chu/TrangChu";
import NoiDungKhoaHoc from "@/pages/hoc-vien/noi-dung-khoa-hoc/NoiDungKhoaHoc";
import ChiTietKhoaHoc from "../pages/hoc-vien/chi-tiet-khoa-hoc/ChiTietKhoaHoc";
import YeuCauLoTrinhAI from "../pages/hoc-vien/yeu-cau-lo-trinh-ai/YeuCauLoTrinhAI";
import KhoaHocAICuaToi from "../pages/hoc-vien/khoa-hoc-ca-nhan-ai/KhoaHocCaNhanAI";
import ChiTietLoTrinhAI from "../pages/hoc-vien/khoa-hoc-ca-nhan-ai/ChiTietLoTrinhAI";
import HoSoHocVienPage from "../pages/hoc-vien/ho-so-hoc-vien/ho-so-hoc-vien";

// /* ===== GIẢNG VIÊN ===== */
import TaoBaiTap from "../pages/giang-vien/tao-bai-tap-test-case/TaoBaiTap";
import TaoQuiz from "../pages/giang-vien/tao-bai-tap-test-case/TaoQuizContent";
import PreviewQuiz from "../pages/giang-vien/tao-bai-tap-test-case/PreviewQuizContent";
import CaiDatQuiz from "../pages/giang-vien/tao-bai-tap-test-case/CaiDatQuizContent";
import ThongKeHocTap from "../pages/giang-vien/thong-ke-hoc-tap/ThongKeHocTap";
import KhoaHocCuaToi from "../pages/giang-vien/khoa-hoc-cua-toi/KhoaHocCuaToi";

// /* ===== ADMIN ===== */
import QuanLyReview from "../pages/quan-tri-vien/quan-ly-binh-luan-review/QuanLyReview";
import QuanLyNguoiDung from "../pages/quan-tri-vien/quan-ly-nguoi-dung/QuanLyNguoiDung";
import QuanLyApiKey from "../pages/quan-tri-vien/quan-ly-api-key/QuanLyApiKey";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ========================================== */}
        {/* ROUTES CÔNG KHAI (Ai cũng vào được)          */}
        {/* ========================================== */}
        <Route path="/dang-nhap" element={<DangNhap />} />
        <Route path="/dang-ky" element={<DangKy />} />
        <Route path="/quen-mat-khau" element={<QuenMatKhau />} />

        <Route element={<LayoutHocVien />}>
          <Route path="/" element={<TrangChuHocVien />} />
          <Route path="/khoa-hoc/:id" element={<ChiTietKhoaHoc />} />
        </Route>


        {/* ========================================== */}
        {/* HỌC VIÊN (Yêu cầu đăng nhập, Role 0, 1, 2)   */}
        {/* ========================================== */}
        <Route
          element={
            <ProtectedRoute allowRoles={[0, 1, 2]}>
              <LayoutHocVien />
            </ProtectedRoute>
          }
        >
          <Route path="/yeu-cau-lo-trinh-ai" element={<YeuCauLoTrinhAI />} />
          <Route path="/ho-so" element={<HoSoHocVienPage />} />
          <Route path="/khoa-hoc-ai-cua-toi" element={<KhoaHocAICuaToi />} />
          <Route path="/chi-tiet-lo-trinh/:id" element={<ChiTietLoTrinhAI />} />
        </Route>

        {/* NỘI DUNG KHÓA HỌC (Layout trống, Role 0, 1, 2) */}
        <Route
          element={
            <ProtectedRoute allowRoles={[0, 1, 2]}>
              <LayoutBlank />
            </ProtectedRoute>
          }
        >
          <Route path="/khoa-hoc/:slug/:id" element={<NoiDungKhoaHoc />} />
        </Route>


        {/* ========================================== */}
        {/* GIẢNG VIÊN (Chỉ Role 1 - GV, và Role 0 - AD) */}
        {/* ========================================== */}
        <Route
          path="/giang-vien"
          element={
            <ProtectedRoute allowRoles={[0, 1]}>
              <LayoutGiangVien />
            </ProtectedRoute>
          }
        >
          <Route index element={<ThongKeHocTap />} /> {/* Default load vào thống kê */}
          <Route path="thong-ke" element={<ThongKeHocTap />} />
          <Route path="bai-tap" element={<TaoBaiTap />} />
          <Route path="quiz" element={<TaoQuiz />} />
          <Route path="preview-quiz" element={<PreviewQuiz />} />
          <Route path="cai-dat" element={<CaiDatQuiz />} />
          <Route path="khoa-hoc-cua-toi" element={<KhoaHocCuaToi />} />
        </Route>


        {/* ========================================== */}
        {/* QUẢN TRỊ VIÊN (Chỉ duy nhất Role 0 - AD)     */}
        {/* ========================================== */}
        <Route
          path="/quan-tri-vien"
          element={
            <ProtectedRoute allowRoles={[0]}>
              <LayoutQuanTriVien />
            </ProtectedRoute>
          }
        >
          <Route index element={<QuanLyNguoiDung />} /> {/* Default load vào Quản lý người dùng */}
          <Route path="nguoi-dung" element={<QuanLyNguoiDung />} />
          <Route path="quan-ly-binh-luan-review" element={<QuanLyReview />} />
          <Route path="quan-ly-api-key" element={<QuanLyApiKey />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../pages/auth/ProtectedRoute"; 

import LayoutHocVien from "../layouts/hoc-vien/LayoutHocVien";
import LayoutBlank from "../layouts/hoc-vien/LayoutBlank";
import LayoutGiangVien from "../layouts/giang-vien/LayoutGiangVien";
import LayoutQuanTriVien from "../layouts/quan-tri-vien/LayoutQuanTriVien";

// /* ===== AUTH ===== */
import DangNhap from "../pages/auth/DangNhap";
import DangKy from "../pages/auth/DangKy";
import QuenMatKhau from "../pages/auth/QuenMatKhau";
import NotFound from "../pages/NotFound";

// /* ===== HỌC VIÊN ===== */
import TrangChuHocVien from "@/pages/hoc-vien/trang-chu/TrangChu";
import NoiDungKhoaHoc from "@/pages/hoc-vien/noi-dung-khoa-hoc/NoiDungKhoaHoc";
import ChiTietKhoaHoc from "../pages/hoc-vien/chi-tiet-khoa-hoc/ChiTietKhoaHoc";
import YeuCauLoTrinhAI from "../pages/hoc-vien/yeu-cau-lo-trinh-ai/YeuCauLoTrinhAI";
import KhoaHocAICuaToi from "../pages/hoc-vien/khoa-hoc-ca-nhan-ai/KhoaHocCaNhanAI";
import ChiTietLoTrinhAI from "../pages/hoc-vien/khoa-hoc-ca-nhan-ai/ChiTietLoTrinhAI";
import HoSoHocVienPage from "../pages/hoc-vien/ho-so-hoc-vien/ho-so-hoc-vien";
import DoiMatKhau from "../pages/hoc-vien/ho-so-hoc-vien/DoiMatKhau";
import QuanLyThietBi from "../pages/hoc-vien/ho-so-hoc-vien/QuanLyThietBi";

// /* ===== GIẢNG VIÊN ===== */
import TaoBaiTap from "../pages/giang-vien/tao-bai-tap-test-case/TaoBaiTap";
import TaoQuiz from "../pages/giang-vien/tao-bai-tap-test-case/TaoQuizContent";
import PreviewQuiz from "../pages/giang-vien/tao-bai-tap-test-case/PreviewQuizContent";
import CaiDatQuiz from "../pages/giang-vien/tao-bai-tap-test-case/CaiDatQuizContent";
import ThongKeHocTap from "../pages/giang-vien/thong-ke-hoc-tap/ThongKeHocTap";
import KhoaHocCuaToi from "../pages/giang-vien/khoa-hoc-cua-toi/KhoaHocCuaToi";
import QuanLyHocVienKhoaHoc from "../pages/giang-vien/quan-ly-hoc-vien/QuanLyHocVienKhoaHoc";
import TaoLoTrinhAI from '../pages/giang-vien/tao-lo-trinh-AI/TaoLoTrinhAI';
// /* ===== ADMIN ===== */
import QuanLyReviewMoi from "../pages/quan-tri-vien/quan-ly-binh-luan-review/QuanLyReviewMoi";
import QuanLyNguoiDung from "../pages/quan-tri-vien/quan-ly-nguoi-dung/QuanLyNguoiDung";
import QuanLyHocVien from "../pages/quan-tri-vien/quan-ly-hoc-vien/QuanLyHocVien";
import QuanLyApiKey from "@/pages/quan-tri-vien/quan-ly-api-key/QuanLyApiKey";

// Component để điều hướng trang chủ dựa trên Role
const HomeRedirect = () => {
  const userRaw = localStorage.getItem('user_info');
  if (!userRaw) return <TrangChuHocVien />;

  const user = JSON.parse(userRaw);
  const role = user.vaiTro !== undefined ? user.vaiTro : user.VaiTro;

  if (role === 0) return <Navigate to="/quan-tri-vien" replace />;
  if (role === 1) return <Navigate to="/giang-vien" replace />;
  return <TrangChuHocVien />;
};

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
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/khoa-hoc/:id" element={<ChiTietKhoaHoc />} />
        </Route>


        {/* ========================================== */}
        {/* HỌC VIÊN (Yêu cầu đăng nhập, Role 2)   */}
        {/* ========================================== */}
        <Route
          element={
            <ProtectedRoute allowRoles={[2]}>
              <LayoutHocVien />
            </ProtectedRoute>
          }
        >
          <Route path="/yeu-cau-lo-trinh-ai" element={<YeuCauLoTrinhAI />} />
          <Route path="/ho-so" element={<HoSoHocVienPage />} />
          <Route path="/bao-mat" element={<DoiMatKhau />} />
          <Route path="/thiet-bi" element={<QuanLyThietBi />} />
          <Route path="/khoa-hoc-ai-cua-toi" element={<KhoaHocAICuaToi />} />
          <Route path="/chi-tiet-lo-trinh/:id" element={<ChiTietLoTrinhAI />} />
        </Route>

        {/* NỘI DUNG KHÓA HỌC (Layout trống, Role 2) */}
        <Route
          element={
            <ProtectedRoute allowRoles={[2]}>
              <LayoutBlank />
            </ProtectedRoute>
          }
        >
          <Route path="/khoa-hoc/:slug/:id" element={<NoiDungKhoaHoc />} />
        </Route>


        {/* ========================================== */}
        {/* GIẢNG VIÊN (Chỉ Role 1 - GV) */}
        {/* ========================================== */}
        <Route
          path="/giang-vien"
          element={
            <ProtectedRoute allowRoles={[1]}>
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
          <Route path="lop-hoc" element={<QuanLyHocVienKhoaHoc />} />
          <Route path="tao-lo-trinh-AI" element={<TaoLoTrinhAI />} />
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
          <Route path="quan-ly-binh-luan-review" element={<QuanLyReviewMoi />} />
          <Route path="quan-ly-hoc-vien" element={<QuanLyHocVien />} />
          <Route path="quan-ly-api-key" element={<QuanLyApiKey />} />
        </Route>

        {/* CATCH ALL 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import React from "react";
import ProtectedRoute from "../pages/auth/ProtectedRoute";

import LayoutHocVien from "../layouts/hoc-vien/LayoutHocVien";
import LayoutBlank from "../layouts/hoc-vien/LayoutBlank";
import LayoutGiangVien from "../layouts/giang-vien/LayoutGiangVien";
import LayoutQuanTriVien from "../layouts/quan-tri-vien/LayoutQuanTriVien";
import { SystemConfigProvider } from "../contexts/SystemConfigContext";

import DangNhap from "../pages/auth/DangNhap";
import DangKy from "../pages/auth/DangKy";
import DangKyGiangVien from "../pages/auth/DangKyGiangVien";
import TrangThaiHoSoGiangVien from "../pages/auth/TrangThaiHoSoGiangVien";
import BoSungHoSoGiangVien from "../pages/auth/BoSungHoSoGiangVien";
import QuenMatKhau from "../pages/auth/QuenMatKhau";
import NotFound from "../pages/NotFound";

import TrangChuHocVien from "@/pages/hoc-vien/trang-chu/TrangChu";import NoiDungKhoaHoc from "@/pages/hoc-vien/noi-dung-khoa-hoc/NoiDungKhoaHoc";import ChiTietKhoaHoc from "../pages/hoc-vien/chi-tiet-khoa-hoc/ChiTietKhoaHoc";
import MuaKhoaHoc from "../pages/hoc-vien/mua-khoa-hoc/MuaKhoaHoc";
import YeuCauLoTrinhAI from "../pages/hoc-vien/yeu-cau-lo-trinh-ai/YeuCauLoTrinhAI";
import KhoaHocAICuaToi from "../pages/hoc-vien/khoa-hoc-ca-nhan-ai/KhoaHocCaNhanAI";
import ChiTietLoTrinhAI from "../pages/hoc-vien/khoa-hoc-ca-nhan-ai/ChiTietLoTrinhAI";
import HoSoHocVienPage from "../pages/hoc-vien/ho-so-hoc-vien/ho-so-hoc-vien";
import KhongGianHocTap from "@/pages/hoc-vien/khong-gian-hoc-tap/KhongGianHocTap";
import ProfilePage from "../pages/hoc-vien/ho-so-hoc-vien/ProfilePage";
import DoiMatKhau from "../pages/hoc-vien/ho-so-hoc-vien/DoiMatKhau";
import QuanLyThietBi from "../pages/hoc-vien/ho-so-hoc-vien/QuanLyThietBi";
import KhamPhaLoTrinh from "../pages/hoc-vien/kham-pha-lo-trinh/KhamPhaLoTrinh";
import PhongVanAI from "../pages/hoc-vien/phong-van-ai/PhongVanAI";
import SinhDoAnAI from "../pages/hoc-vien/sinh-do-an-ai/SinhDoAnAI";

import PhongVanDoAn from "../pages/hoc-vien/phong-van-do-an/PhongVanDoAn";

import NhapMaQuaTang from "@/pages/hoc-vien/qua-tang-khoa-hoc/NhapMaQuaTang";
import LichSuMaQuaTang from "@/pages/hoc-vien/qua-tang-khoa-hoc/LichSuMaQuaTang";
import ThuThach from "@/pages/hoc-vien/thu-thach/ThuThach";


import QuanLyBaiTapPage from "../pages/giang-vien/quan-ly-bai-tap/QuanLyBaiTapPage";
import ThongKeHocTap from "../pages/giang-vien/thong-ke-hoc-tap/ThongKeHocTap";
import KhoaHocCuaToi from "../pages/giang-vien/khoa-hoc-cua-toi/KhoaHocCuaToi";
import QuanLyHocVienKhoaHoc from "../pages/giang-vien/quan-ly-hoc-vien/QuanLyHocVienKhoaHoc";
import TangKhoaHocGiangVien from "../pages/giang-vien/tang-khoa-hoc/TangKhoaHocGiangVien";
import TaoLoTrinhAI from "../pages/giang-vien/tao-lo-trinh-AI/TaoLoTrinhAI";
import RutTienGiangVien from "../pages/giang-vien/rut-tien/RutTienGiangVien";
import NapTienAI from "../pages/giang-vien/nap-tien-ai/NapTienAI";
import QuanLyMaGiamGiaGiangVien from "@/pages/giang-vien/ma-giam-gia/QuanLyMaGiamGiaGiangVien";

import QuanLyReviewMoi from "../pages/quan-tri-vien/quan-ly-binh-luan-review/QuanLyReviewMoi";
import QuanLyNguoiDung from "../pages/quan-tri-vien/quan-ly-nguoi-dung/QuanLyNguoiDung";
import QuanLyHocVien from "../pages/quan-tri-vien/quan-ly-hoc-vien/QuanLyHocVien";
import QuanLyApiKey from "@/pages/quan-tri-vien/quan-ly-api-key/QuanLyApiKey";
import CauHinhHeThong from "../pages/quan-tri-vien/cau-hinh-he-thong/CauHinhHeThong";
import ThongKeAdmin from "@/pages/quan-tri-vien/thong-ke/ThongKeAdmin";
import QuanLyRutTienGiangVien from "../pages/quan-tri-vien/rut-tien-giang-vien/QuanLyRutTienGiangVien";
import QuanLyHoTroThanhToanHocVien from "@/pages/quan-tri-vien/ho-tro-thanh-toan-hoc-vien/QuanLyHoTroThanhToanHocVien";
import QuanLyMaQuaTang from "@/pages/quan-tri-vien/ma-qua-tang/QuanLyMaQuaTang";
import QuanLyMaGiamGiaAdmin from "@/pages/quan-tri-vien/ma-giam-gia/QuanLyMaGiamGiaAdmin";
import DuyetGiangVien from "@/pages/quan-tri-vien/duyet-giang-vien/DuyetGiangVien";

const readUserInfo = (): any | null => {
  const userRaw = localStorage.getItem("user_info");
  if (!userRaw || userRaw === "undefined" || userRaw === "null") return null;

  try {
    const parsed = JSON.parse(userRaw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    localStorage.removeItem("user_info");
    return null;
  }
};

const DANG_KY_GIANG_VIEN_SESSION_KEY = 'educodeai:dang-ky-giang-vien:draft';

const RegistrationDraftBoundary = () => {
  const location = useLocation();
  const previousPath = React.useRef(location.pathname);

  React.useEffect(() => {
    const wasRegistration = previousPath.current === '/dang-ky-giang-vien';
    const isRegistration = location.pathname === '/dang-ky-giang-vien';
    if (wasRegistration && !isRegistration) {
      sessionStorage.removeItem(DANG_KY_GIANG_VIEN_SESSION_KEY);
    }
    previousPath.current = location.pathname;
  }, [location.pathname]);

  return <Outlet />;
};


const PublicAuthRoute = ({ children }: { children?: React.ReactNode }) => {
  const user = readUserInfo();
  if (!user) return children ? <>{children}</> : <Outlet />;
  const role = user.vaiTro !== undefined ? user.vaiTro : user.VaiTro;
  if (role === 0) return <Navigate to="/quan-tri-vien" replace />;
  if (role === 1) return <Navigate to="/giang-vien" replace />;
  return children ? <>{children}</> : <Outlet />;
};

const PublicRoute = ({ children }: { children?: React.ReactNode }) => {
  return children ? <>{children}</> : <Outlet />;
};

export default function AppRouter() {
  return (
    <SystemConfigProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<RegistrationDraftBoundary />}>
          <Route element={<PublicAuthRoute />}>
            <Route path="/dang-nhap" element={<DangNhap />} />
            <Route path="/dang-ky" element={<DangKy />} />
            <Route path="/dang-ky-giang-vien" element={<DangKyGiangVien />} />
            <Route path="/trang-thai-ho-so-giang-vien" element={<TrangThaiHoSoGiangVien />} />
            <Route path="/bo-sung-ho-so/:maHoSo" element={<BoSungHoSoGiangVien />} />
            <Route path="/quen-mat-khau" element={<QuenMatKhau />} />
          </Route>

          <Route element={<PublicRoute><LayoutHocVien /></PublicRoute>}>
            <Route path="/" element={<TrangChuHocVien />} />
            <Route path="/khoa-hoc/:id" element={<ChiTietKhoaHoc />} />
          </Route>

          <Route element={<ProtectedRoute allowRoles={[0, 1, 2]}><LayoutHocVien /></ProtectedRoute>}>
            <Route path="/yeu-cau-lo-trinh-ai" element={<YeuCauLoTrinhAI />} />
            <Route path="/khong-gian-hoc-tap" element={<KhongGianHocTap />} />
            <Route path="/thu-thach-hoc-tap" element={<ThuThach />} />
            <Route path="/mua-khoa-hoc/:id" element={<MuaKhoaHoc />} />
            <Route path="/ho-so" element={<HoSoHocVienPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/hoc-vien/khoa-hoc-cua-toi" element={<Navigate to="/khong-gian-hoc-tap" replace />} />
            <Route path="/bao-mat" element={<DoiMatKhau />} />
            <Route path="/thiet-bi" element={<QuanLyThietBi />} />
            <Route path="/khoa-hoc-ai-cua-toi" element={<KhoaHocAICuaToi />} />
            <Route path="/chi-tiet-lo-trinh/:id" element={<ChiTietLoTrinhAI />} />
            <Route path="/kham-pha-lo-trinh" element={<KhamPhaLoTrinh />} />
            <Route path="/phong-van-ai" element={<PhongVanAI />} />
            <Route path="/sinh-do-an-ai" element={<SinhDoAnAI />} />
            <Route path="/phong-van-do-an/:sessionId" element={<PhongVanDoAn />} />
            <Route path="/hoc-vien/nhap-ma-qua-tang" element={<NhapMaQuaTang />} />
            <Route path="/hoc-vien/lich-su-ma-qua-tang" element={<LichSuMaQuaTang />} />
          </Route>

          <Route element={<ProtectedRoute allowRoles={[0, 1, 2]}><LayoutBlank /></ProtectedRoute>}>
            <Route path="/khoa-hoc/:slug/:id" element={<NoiDungKhoaHoc />} />
          </Route>

          <Route path="/giang-vien" element={<ProtectedRoute allowRoles={[0, 1]}><LayoutGiangVien /></ProtectedRoute>}>
            <Route index element={<ThongKeHocTap />} />
            <Route path="thong-ke" element={<ThongKeHocTap />} />
            <Route path="nap-tien-ai" element={<NapTienAI />} />
            <Route path="bai-tap" element={<QuanLyBaiTapPage />} />
            <Route path="quiz" element={<Navigate to="/giang-vien/bai-tap" replace />} />
            <Route path="preview-quiz" element={<Navigate to="/giang-vien/bai-tap" replace />} />
            <Route path="cai-dat" element={<Navigate to="/giang-vien/bai-tap" replace />} />
            <Route path="khoa-hoc-cua-toi" element={<KhoaHocCuaToi />} />
            <Route path="lop-hoc" element={<QuanLyHocVienKhoaHoc />} />
            <Route path="tang-khoa-hoc" element={<TangKhoaHocGiangVien />} />
            <Route path="tao-lo-trinh-AI" element={<TaoLoTrinhAI />} />
            <Route path="bai-tap-thuc-hanh" element={<Navigate to="/giang-vien/bai-tap" replace />} />
            <Route path="rut-tien" element={<RutTienGiangVien />} />
            <Route path="ma-giam-gia" element={<QuanLyMaGiamGiaGiangVien />} />
          </Route>

          <Route path="/quan-tri-vien" element={<ProtectedRoute allowRoles={[0]}><LayoutQuanTriVien /></ProtectedRoute>}>
            <Route index element={<ThongKeAdmin />} />
            <Route path="thong-ke" element={<ThongKeAdmin />} />
            <Route path="nguoi-dung" element={<QuanLyNguoiDung />} />
            <Route path="quan-ly-binh-luan-review" element={<QuanLyReviewMoi />} />
            <Route path="quan-ly-hoc-vien" element={<QuanLyHocVien />} />
            <Route path="quan-ly-api-key" element={<QuanLyApiKey />} />
            <Route path="cau-hinh-he-thong" element={<CauHinhHeThong />} />
            <Route path="rut-tien-giang-vien" element={<QuanLyRutTienGiangVien />} />
            <Route path="ho-tro-thanh-toan-hoc-vien" element={<QuanLyHoTroThanhToanHocVien />} />
            <Route path="ma-qua-tang" element={<QuanLyMaQuaTang />} />
            <Route path="ma-giam-gia" element={<QuanLyMaGiamGiaAdmin />} />
            <Route path="duyet-giang-vien" element={<DuyetGiangVien />} />
          </Route>

          <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SystemConfigProvider>
  );
}





using educodeai_server.DTOs.XacThuc;
using educodeai_server.DTOs.NguoiDung;
using EduCodeAI.DTOs;

namespace educodeai_server.Services.Interface
{
    public interface IXacThucService
    {
        // --- CÁC HÀM ĐĂNG NHẬP ---
        Task<object> DangNhapAsync(DangNhapRequest request, string ipAddress);
        Task<object> XacNhanOtpVaDangNhapAsync(XacNhanOtpRequest request);
        Task<object> DangNhapGoogleAsync(GoogleLoginRequest request, string maThietBi, string tenThietBi);
        Task<object> DangNhapFacebookAsync(FacebookDTO request, string maThietBi, string tenThietBi);
        Task<object> LamMoiTokenAsync(string refreshToken, string maThietBi);

        // --- CÁC HÀM ĐĂNG KÝ MỚI (Dùng Bộ nhớ tạm RAM) ---
        Task<bool> YeuCauDangKyAsync(DangKyRequest request, string ipAddress);
        Task<object> XacNhanDangKyVaLuuDbAsync(XacNhanOtpRequest request);

        // --- CÁC HÀM QUÊN MK ---
        Task<object> YeuCauQuenMatKhauAsync(QuenMatKhauRequest request, string ipAddress);
        Task<object> DatLaiMatKhauAsync(DatLaiMatKhauRequest request);

        // CÁC HÀM ĐỔI MẬT KHẨU
        Task<bool> DoiMatKhauAsync(int maNguoiDung, DoiMatKhauRequest request);

        // --- CÁC HÀM QUẢN LÝ THIẾT BỊ ---
        Task<object> LayDanhSachThietBiAsync(int maNguoiDung, string maThietBiHienTai);
        Task<bool> DangXuatAsync(int maNguoiDung, string maThietBi);
        Task<bool> YeuCauOtpDangXuatTuXaAsync(int maNguoiDung);
        Task<bool> XacNhanDangXuatTuXaAsync(int maNguoiDung, DangXuatTuXaRequest request);
    }
}
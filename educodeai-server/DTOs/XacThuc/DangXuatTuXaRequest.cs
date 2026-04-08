using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace educodeai_server.DTOs.XacThuc
{
    public class DangXuatTuXaRequest
    {
        [Required(ErrorMessage = "Thiếu mã xác minh Captcha.")]
        public string CaptchaToken { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập mã OTP.")]
        public string OtpCode { get; set; }

        public bool DangXuatTatCa { get; set; } // True: Xóa hết thiết bị khác. False: Xóa theo danh sách.

        public List<int>? DanhSachMaPhien { get; set; } // Chứa ID các phiên bị chọn đăng xuất
    }
}
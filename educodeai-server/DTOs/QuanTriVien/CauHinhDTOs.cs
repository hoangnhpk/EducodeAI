using System.ComponentModel.DataAnnotations;

namespace educodeai_server.DTOs.QuanTriVien
{
    // DTO dùng để hứng dữ liệu từ giao diện Admin gửi lên khi bấm "LƯU THAY ĐỔI"
    public class CauHinhUpdateDto
    {
        [Required(ErrorMessage = "Mã khóa không được để trống")]
        public string MaKhoa { get; set; } = string.Empty;

        public string? GiaTri { get; set; }
    }
}
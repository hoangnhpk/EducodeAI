using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class TienDoBaiHocModel {
        [Key]
        public int MaTienDo { get; set; }

        public int MaNguoiDung { get; set; }
        [ForeignKey("MaNguoiDung")]
        public virtual NguoiDungModel NguoiDung { get; set; } = null!;

        public int MaBaiHoc { get; set; }
        [ForeignKey("MaBaiHoc")]
        public virtual BaiHocModel BaiHoc { get; set; } = null!;

        public bool DaXem { get; set; } = false;

        /// <summary>
        /// Thời gian đã xem bài học, đơn vị là <b>GIÂY</b>.
        /// Nguồn ghi duy nhất: client gửi currentTime của player video
        /// (NoiDungVideo.tsx → KhoaHocService.luuTienDo).
        /// KHÔNG dùng cột này để lưu phần trăm hay số phút; nơi nào cần phút
        /// thì tự chia 60 khi đọc (xem ThuThachService, QuanLyHocVienKhoaHocService).
        /// </summary>
        public int ThoiGianHoc { get; set; } = 0;

        public DateTime NgayCapNhat { get; set; } = DateTime.UtcNow;
    }
}

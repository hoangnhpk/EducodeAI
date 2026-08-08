namespace educodeai_server.Config
{
    public class PaymentMailOptions
    {
        public bool Enabled { get; set; }

        /// <summary>
        /// Link mở trang khóa học của tôi trong email thanh toán.
        /// Ví dụ: http://localhost:3000/hoc-vien/khoa-hoc-cua-toi
        /// </summary>
        public string FrontendCourseUrl { get; set; } = "http://localhost:3000/hoc-vien/khoa-hoc-cua-toi";

        /// <summary>
        /// Link ví / rút tiền giảng viên trong email xác nhận chuyển khoản.
        /// Ví dụ: http://localhost:3000/giang-vien/rut-tien
        /// </summary>
        public string FrontendGiangVienRutTienUrl { get; set; } = "http://localhost:3000/giang-vien/rut-tien";

        /// <summary>
        /// Link trang bổ sung hồ sơ giảng viên trong email.
        /// </summary>
        public string FrontendGiangVienBoSungUrl { get; set; } = "http://localhost:3000/bo-sung-ho-so";
    }
}

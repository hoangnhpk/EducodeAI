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
    }
}

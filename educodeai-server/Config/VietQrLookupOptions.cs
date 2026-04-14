namespace educodeai_server.Config
{
    /// <summary>
    /// API tra cứu STK VietQR.io (POST /v2/lookup) — chỉ dùng xác nhận tài khoản giảng viên.
    /// Đăng ký credential tại https://my.vietqr.io/ (Account Number Lookup).
    /// </summary>
    public class VietQrLookupOptions
    {
        /// <summary>Ví dụ: https://api.vietqr.io/v2</summary>
        public string BaseUrl { get; set; } = "https://api.vietqr.io/v2";

        public string ClientId { get; set; } = string.Empty;

        public string ApiKey { get; set; } = string.Empty;
    }
}

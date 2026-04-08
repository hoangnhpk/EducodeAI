using System.Net;
using System.Net.Mail;

namespace educodeai_server.Helpers
{
    public static class EmailHelper
    {
        private static IConfiguration? _config;

        /// <summary>
        /// Khởi tạo cấu hình cho EmailHelper (Gọi trong Program.cs)
        /// </summary>
        public static void Initialize(IConfiguration config)
        {
            _config = config;
        }

        /// <summary>
        /// Gửi email sử dụng cấu hình từ appsettings.json
        /// </summary>
        public static async Task<bool> SendEmailAsync(string toEmail, string subject, string body)
        {
            try
            {
                if (_config == null) throw new Exception("EmailHelper chưa được khởi tạo cấu hình!");

                // Đọc thông tin từ file appsettings.json
                var smtpServer = _config["EmailConfig:SmtpServer"];
                var port = int.Parse(_config["EmailConfig:Port"] ?? "587");
                var senderEmail = _config["EmailConfig:SenderEmail"];
                var password = _config["EmailConfig:Password"];
                var senderName = _config["EmailConfig:SenderName"];

                using var smtp = new SmtpClient(smtpServer, port)
                {
                    Credentials = new NetworkCredential(senderEmail, password),
                    EnableSsl = true
                };

                using var message = new MailMessage();
                message.From = new MailAddress(senderEmail!, senderName);
                message.To.Add(toEmail);
                message.Subject = subject;
                message.Body = body;
                message.IsBodyHtml = true;

                await smtp.SendMailAsync(message);
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi gửi email: {ex.Message}");
                return false;
            }
        }
    }
}
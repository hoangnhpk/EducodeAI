using System.Net;
using System.Net.Mail;
using System.Linq;
using System.Text;

namespace educodeai_server.Helpers
{
    public class EmailAttachmentData
    {
        public string FileName { get; set; } = string.Empty;
        public byte[] Content { get; set; } = Array.Empty<byte>();
        public string MediaType { get; set; } = "application/octet-stream";
    }

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
            return await SendEmailAsync(toEmail, subject, body, null);
        }

        public static async Task<bool> SendEmailAsync(
            string toEmail,
            string subject,
            string body,
            IEnumerable<EmailAttachmentData>? attachments)
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
                message.From = new MailAddress(senderEmail!, senderName, Encoding.UTF8);
                message.To.Add(toEmail);
                message.Subject = subject;
                message.SubjectEncoding = Encoding.UTF8;
                message.HeadersEncoding = Encoding.UTF8;
                message.Body = body;
                message.BodyEncoding = Encoding.UTF8;
                message.IsBodyHtml = true;

                if (attachments != null)
                {
                    foreach (var attachment in attachments.Where(x => x.Content.Length > 0))
                    {
                        var stream = new MemoryStream(attachment.Content);
                        message.Attachments.Add(new Attachment(stream, attachment.FileName, attachment.MediaType));
                    }
                }

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

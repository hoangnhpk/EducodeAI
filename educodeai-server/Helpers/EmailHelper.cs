using System.Net;
using System.Net.Mail;

namespace educodeai_server.Helpers // Đổi namespace cho đồng bộ
{
    public static class EmailHelper
    {
        public static async Task<bool> SendEmailAsync(string toEmail, string subject, string body)
        {
            try
            {
                using var smtp = new SmtpClient("smtp.gmail.com", 587)
                {
                    Credentials = new NetworkCredential("taiptpk04158@gmail.com", "esvu qupo qryq peop"),
                    EnableSsl = true
                };

                using var message = new MailMessage();
                message.From = new MailAddress("taiptpk04158@gmail.com", "EduCodeAI Support");
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
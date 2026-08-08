using System.Net;
using educodeai_server.Helpers;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace educodeai_server.Workers
{
    public class LopHocEmailWorker : BackgroundService
    {
        private readonly LopHocEmailQueue _queue;
        private readonly ILogger<LopHocEmailWorker> _logger;

        public LopHocEmailWorker(LopHocEmailQueue queue, ILogger<LopHocEmailWorker> logger)
        {
            _queue = queue;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            try
            {
                await XuLyHangDoiAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                // Tắt ứng dụng là đường đi bình thường, không phải lỗi. Nếu để exception này
                // thoát ra khỏi ExecuteAsync, BackgroundService sẽ báo lỗi và dừng cả host.
                _logger.LogInformation("LopHocEmailWorker dừng theo yêu cầu tắt ứng dụng.");
            }
        }

        private async Task XuLyHangDoiAsync(CancellationToken stoppingToken)
        {
            await foreach (var job in _queue.ReadAllAsync(stoppingToken))
            {
                foreach (var nguoiNhan in job.NguoiNhan)
                {
                    if (string.IsNullOrWhiteSpace(nguoiNhan.Email))
                        continue;

                    try
                    {
                        var body = job.NoiDungHtml
                            .Replace("{{hoTen}}", WebUtility.HtmlEncode(nguoiNhan.HoTen))
                            .Replace("{{tienDo}}", nguoiNhan.PhanTramTienDo.ToString())
                            .Replace("{{tenKhoaHoc}}", WebUtility.HtmlEncode(job.TenKhoaHoc));

                        var ok = await EmailHelper.SendEmailAsync(nguoiNhan.Email.Trim(), job.TieuDe, body);
                        if (!ok)
                        {
                            _logger.LogWarning(
                                "Gửi mail lớp học thất bại: GV={MaGiangVien}, email={Email}",
                                job.MaGiangVien, nguoiNhan.Email);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Lỗi gửi mail lớp học tới {Email}", nguoiNhan.Email);
                    }

                    await Task.Delay(200, stoppingToken);
                }
            }
        }
    }
}

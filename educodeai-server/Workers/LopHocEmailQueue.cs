using System.Threading.Channels;

namespace educodeai_server.Workers
{
    public record LopHocEmailRecipient(string Email, string HoTen, int PhanTramTienDo);

    public record LopHocEmailJob(
        int MaGiangVien,
        string TenKhoaHoc,
        List<LopHocEmailRecipient> NguoiNhan,
        string TieuDe,
        string NoiDungHtml);

    public class LopHocEmailQueue
    {
        private readonly Channel<LopHocEmailJob> _channel =
            Channel.CreateUnbounded<LopHocEmailJob>(new UnboundedChannelOptions
            {
                SingleReader = true,
                SingleWriter = false
            });

        public ValueTask EnqueueAsync(LopHocEmailJob job, CancellationToken ct = default)
            => _channel.Writer.WriteAsync(job, ct);

        public IAsyncEnumerable<LopHocEmailJob> ReadAllAsync(CancellationToken ct)
            => _channel.Reader.ReadAllAsync(ct);
    }
}

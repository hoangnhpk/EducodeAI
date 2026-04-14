namespace educodeai_server.Services.Interface
{
    public interface IVietQrLookupApiService
    {
        /// <summary>POST /lookup — bin (int) + accountNumber.</summary>
        Task<VietQrTraCuuKetQua> TraCuuTaiKhoanAsync(
            int bin,
            string accountNumber,
            CancellationToken cancellationToken = default);
    }

    public sealed class VietQrTraCuuKetQua
    {
        public bool ThanhCong { get; init; }

        public string? MaCode { get; init; }

        public string? MoTa { get; init; }

        public string? AccountName { get; init; }
    }
}

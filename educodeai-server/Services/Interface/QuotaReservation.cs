namespace educodeai_server.Services.Interface
{
    /// <summary>
    /// Biên nhận của một lần ReserveQuotaAsync thành công. Giữ lại đúng bucket phút/ngày
    /// đã INCR lúc reserve, để CommitQuotaAsync hoàn token vào cùng bucket thay vì tính lại
    /// theo UtcNow (tránh lệch bucket khi call AI kéo qua ranh giới phút).
    /// </summary>
    public record QuotaReservation(
        int KeyId,
        string PhutSuffix,
        string NgaySuffix,
        int EstimatedTokens);
}

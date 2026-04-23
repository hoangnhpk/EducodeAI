namespace educodeai_server.Services.Interface
{
    public interface IRutTienGiangVienEmailService
    {
        /// <summary>Gửi email cho giảng viên khi yêu cầu rút tiền ở trạng thái đã chuyển khoản (idempotent theo DB).</summary>
        Task GuiEmailKhiRutTienDaChuyenKhoanAsync(int maYeuCauRutTien);
    }
}

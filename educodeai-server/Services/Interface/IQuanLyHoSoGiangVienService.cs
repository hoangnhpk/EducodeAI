using educodeai_server.DTOs.QuanLyHoSoGiangVien;

namespace educodeai_server.Services.Interface
{
    public interface IQuanLyHoSoGiangVienService
    {
        /// <summary>Lấy danh sách hồ sơ, lọc theo trạng thái (nếu có).</summary>
        Task<object> LayDanhSachHoSoAsync(string? trangThai = null);

        /// <summary>Lấy chi tiết một hồ sơ theo mã.</summary>
        Task<object> LayChiTietHoSoAsync(long maHoSo);

        /// <summary>Lấy danh sách yêu cầu chứng chỉ với bộ lọc và phân trang server-side.</summary>
        Task<ChungChiAdminPagedDTO> LayDanhSachChungChiAsync(ChungChiAdminFilterRequest filter);

        /// <summary>Tải file riêng tư của một yêu cầu chứng chỉ.</summary>
        Task<HoSoGiangVienTaiLieuDownloadDTO> TaiChungChiAsync(long maTaiLieu);

        /// <summary>Áp dụng một quyết định cho từng chứng chỉ đang chờ trong cùng đợt gửi.</summary>
        Task<object> QuyetDinhChungChiAsync(Guid maDotGui, int maQuanTriVien, QuyetDinhDotChungChiRequest request);

        /// <summary>Duyệt toàn bộ chứng chỉ trong một đợt gửi.</summary>
        Task<object> DuyetChungChiAsync(Guid maDotGui, int maQuanTriVien);

        /// <summary>Từ chối hoặc yêu cầu bổ sung toàn bộ đợt gửi chứng chỉ.</summary>
        Task<object> XuLyChungChiAsync(Guid maDotGui, int maQuanTriVien, string trangThai, XuLyChungChiRequest request);

        /// <summary>Lấy tài liệu riêng tư sau khi kiểm tra tài liệu thuộc đúng hồ sơ.</summary>
        Task<HoSoGiangVienTaiLieuDownloadDTO> TaiTaiLieuAsync(long maHoSo, long maTaiLieu);

        /// <summary>Đếm số hồ sơ đang chờ duyệt (cho badge thông báo).</summary>
        Task<int> DemHoSoChoDuyetAsync();

        /// <summary>
        /// Duyệt hồ sơ: tạo tài khoản NguoiDung (VaiTro=1), link MaNguoiDung vào hồ sơ,
        /// gửi email thông báo cho giảng viên.
        /// </summary>
        Task<object> DuyetHoSoAsync(long maHoSo, int maQuanTriVien);

        /// <summary>Từ chối hồ sơ kèm lý do, gửi email thông báo.</summary>
        Task<object> TuChoiHoSoAsync(long maHoSo, int maQuanTriVien, TuChoiHoSoRequest request);

        /// <summary>Yêu cầu bổ sung hồ sơ, gửi email hướng dẫn bổ sung.</summary>
        Task<object> YeuCauBoSungHoSoAsync(long maHoSo, int maQuanTriVien, YeuCauBoSungHoSoRequest request);

    }
}

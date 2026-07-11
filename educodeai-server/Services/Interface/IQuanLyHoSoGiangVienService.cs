using educodeai_server.DTOs.QuanLyHoSoGiangVien;

namespace educodeai_server.Services.Interface
{
    public interface IQuanLyHoSoGiangVienService
    {
        /// <summary>Lấy danh sách hồ sơ, lọc theo trạng thái (nếu có).</summary>
        Task<object> LayDanhSachHoSoAsync(string? trangThai = null);

        /// <summary>Lấy chi tiết một hồ sơ theo mã.</summary>
        Task<object> LayChiTietHoSoAsync(long maHoSo);

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

        /// <summary>Lấy file ảnh CCCD private để admin xem (stream + content-type).</summary>
        Task<(Stream Stream, string ContentType, string FileName)?> LayAnhGiayToAsync(long maHoSo, string mat);
    }
}
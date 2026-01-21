using educodeai_server.DTOs.KhoaHoc;
using educodeai_server.Repository.Interface;
using educodeai_server.Services.Interface;

namespace educodeai_server.Services.Implementation
{
    public class KhoaHocCuaToiService : IKhoaHocCuaToiService
    {
        private readonly IKhoaHocRepository _khoaHocRepo;

        public KhoaHocCuaToiService(IKhoaHocRepository khoaHocRepo)
        {
            _khoaHocRepo = khoaHocRepo;
        }

        public async Task<List<DanhSachKhoaHocGiangVienDTO>> GetDanhSachKhoaHocGiangVienAsync(int maGiangVien)
        {
            var khoaHocs = await _khoaHocRepo.GetKhoaHocsByGiangVienAsync(maGiangVien);
            
            return khoaHocs.Select(k => new DanhSachKhoaHocGiangVienDTO
            {
                MaKhoaHoc = k.MaKhoaHoc,
                TenKhoaHoc = k.TenKhoaHoc,
                HinhAnh = k.HinhAnh,
                TrangThai = k.TrangThai,
                SoHocVien = k.DangKyKhoaHocs.Count,
                TienDoTrungBinh = k.DangKyKhoaHocs.Any() ? Math.Round(k.DangKyKhoaHocs.Average(d => d.TienDo), 1) : 0
            }).ToList();
        }

        public async Task<ChiTietKhoaHocDTO?> GetChiTietKhoaHoc(int maKhoaHoc)
        {
            var khoaHoc = await _khoaHocRepo.GetKhoaHocWithDetailsAsync(maKhoaHoc);
            if (khoaHoc == null) return null;

            var registrations = khoaHoc.DangKyKhoaHocs.ToList();

            return new ChiTietKhoaHocDTO
            {
                MaKhoaHoc = khoaHoc.MaKhoaHoc,
                TenKhoaHoc = khoaHoc.TenKhoaHoc,
                SiSo = $"{registrations.Count}/50",
                TiLeHoanThanh = registrations.Any() ? Math.Round(registrations.Average(d => d.TienDo), 1) : 0,
                DiemDanhGia = khoaHoc.DiemDanhGiaTB,
                
                DanhSachHocVien = registrations.Select(d => new HocVienTrongLopDTO
                {
                    MaNguoiDung = d.MaNguoiDung,
                    HoTen = d.NguoiDung.HoTen ?? "Học viên",
                    Email = d.NguoiDung.Email ?? "",
                    NgayDangKy = d.NgayDangKy,
                    TienDo = d.TienDo
                }).ToList()
            };
        }
    }
}
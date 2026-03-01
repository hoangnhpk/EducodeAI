using educodeai_server.DTOs;
using educodeai_server.Models;
using educodeai_server.Repository.Interface;
using educodeai_server.Services.Interface;

namespace educodeai_server.Services.Implement
{
    public class KhoaHocCuaToiService : IKhoaHocCuaToiService
    {
        private readonly IKhoaHocCuaToiRepository _repository;

        public KhoaHocCuaToiService(IKhoaHocCuaToiRepository repository)
        {
            _repository = repository;
        }

        // ===== DANH SÁCH =====
        public async Task<List<KhoaHocGiangVienListDTO>> GetDanhSachKhoaHocAsync(int maGiangVien)
        {
            var khoaHocs = await _repository.GetKhoaHocByGiangVienAsync(maGiangVien);

            return khoaHocs.Select(k => new KhoaHocGiangVienListDTO
            {
                MaKhoaHoc = k.MaKhoaHoc,
                TenKhoaHoc = k.TenKhoaHoc,
                HinhAnh = k.HinhAnh,
                LinhVuc = k.LinhVuc,
                TrinhDo = k.TrinhDo,
                ThoiLuongGio = k.ThoiLuongGio,
                SoHocVien = k.DangKyKhoaHocs?.Count ?? 0,
                DiemDanhGiaTB = k.DiemDanhGiaTB,
                TrangThai = k.TrangThai,
                NgayTao = k.NgayTao,
                TienDoTrungBinh = (k.DangKyKhoaHocs != null && k.DangKyKhoaHocs.Count > 0)
                    ? k.DangKyKhoaHocs.Average(dk => (double)dk.TienDo)
                    : 0.0,

            }).ToList();
        }

        // ===== CHI TIẾT =====
        public async Task<KhoaHocGiangVienDetailDTO?> GetChiTietKhoaHocAsync(int maKhoaHoc, int maGiangVien)
        {
            var k = await _repository.GetKhoaHocDetailAsync(maKhoaHoc, maGiangVien);
            if (k == null) return null;

            return new KhoaHocGiangVienDetailDTO
            {
                MaKhoaHoc = k.MaKhoaHoc,
                TenKhoaHoc = k.TenKhoaHoc,
                MoTa = k.MoTa,
                HinhAnh = k.HinhAnh,
                LinhVuc = k.LinhVuc,
                TrinhDo = k.TrinhDo,
                ThoiLuongGio = k.ThoiLuongGio,
                TrangThai = k.TrangThai,
                NgayTao = k.NgayTao,
                SoHocVien = k.DangKyKhoaHocs?.Count ?? 0,
                DiemDanhGiaTB = k.DiemDanhGiaTB,

                TiLeHoanThanh = (k.DangKyKhoaHocs != null && k.DangKyKhoaHocs.Count > 0)
                    ? k.DangKyKhoaHocs.Average(dk => (double)dk.TienDo)
                    : 0.0,

                DanhSachHocVien = k.DangKyKhoaHocs?.Select(d => new HocVienTrongKhoaHocDTO
                {
                    MaNguoiDung = d.MaNguoiDung,
                    HoTen = d.NguoiDung.HoTen,
                    Email = d.NguoiDung.Email,
                    AnhDaiDien = d.NguoiDung.AnhDaiDien,
                    NgayDangKy = d.NgayDangKy,
                    TienDo = d.TienDo,

                }).ToList() ?? new(),
                DanhSachChuong = k.ChuongHocs?.OrderBy(c => c.ThuTu).Select(c => new ChuongHocDetailDTO
                {
                    MaChuong = c.MaChuong,
                    TenChuong = c.TenChuong,
                    ThuTu = c.ThuTu,
                    DanhSachBaiHoc = c.BaiHocs?.OrderBy(b => b.ThuTu).Select(b => new BaiHocVideoDetailDTO
                    {
                        MaBaiHoc = b.MaBaiHoc,
                        TieuDe = b.TieuDe,
                        LinkVideo = b.LinkVideo,
                        ThoiLuong = b.ThoiLuong ?? 0,
                        ThuTu = b.ThuTu,
                    }).ToList() ?? new(),
                }).ToList() ?? new(),
            };
        }

        // ===== TẠO KHÓA HỌC =====
        public async Task<bool> TaoKhoaHocAsync(int maGiangVien, KhoaHocCreateUpdateDTO dto)
        {
            var khoaHoc = new KhoaHocModel
            {
                TenKhoaHoc = dto.TenKhoaHoc,
                MoTa = dto.MoTa,
                HinhAnh = dto.HinhAnh,
                LinhVuc = dto.LinhVuc,
                TrinhDo = dto.TrinhDo,
                ThoiLuongGio = dto.ThoiLuongGio,
                TrangThai = dto.TrangThai,
                MaGiangVien = maGiangVien,
                NgayTao = DateTime.Now,
                KyNangChinh = dto.KyNangChinh,
            };

            await _repository.AddKhoaHocAsync(khoaHoc);
            await _repository.SaveChangesAsync();
            return true;
        }

        // ===== CẬP NHẬT KHÓA HỌC =====
        public async Task<bool> CapNhatKhoaHocAsync(int maKhoaHoc, int maGiangVien, KhoaHocCreateUpdateDTO dto)
        {
            var khoaHoc = await _repository.GetKhoaHocDetailAsync(maKhoaHoc, maGiangVien);
            if (khoaHoc == null) return false;

            khoaHoc.TenKhoaHoc = dto.TenKhoaHoc;
            khoaHoc.MoTa = dto.MoTa;
            khoaHoc.HinhAnh = dto.HinhAnh;
            khoaHoc.LinhVuc = dto.LinhVuc;
            khoaHoc.TrinhDo = dto.TrinhDo;
            khoaHoc.ThoiLuongGio = dto.ThoiLuongGio;
            khoaHoc.TrangThai = dto.TrangThai;
            khoaHoc.KyNangChinh = dto.KyNangChinh;

            await _repository.UpdateKhoaHocAsync(khoaHoc);
            await _repository.SaveChangesAsync();
            return true;
        }

        // ===== XÓA KHÓA HỌC =====
        public async Task<bool> XoaKhoaHocAsync(int maKhoaHoc, int maGiangVien)
        {
            var khoaHoc = await _repository.GetKhoaHocDetailAsync(maKhoaHoc, maGiangVien);
            if (khoaHoc == null) return false;

            await _repository.DeleteKhoaHocAsync(khoaHoc);
            await _repository.SaveChangesAsync();
            return true;
        }

        // ===== THÊM CHƯƠNG =====
        public async Task<ThemChuongResponseDTO> ThemChuongAsync(int maKhoaHoc, ChuongHocCreateUpdateDTO dto)
        {
            var chuong = new ChuongHocModel
            {
                MaKhoaHoc = maKhoaHoc,
                TenChuong = dto.TenChuong,
                ThuTu = dto.ThuTu,
            };

            await _repository.AddChuongAsync(chuong);
            await _repository.SaveChangesAsync();
            return new ThemChuongResponseDTO
            {
                MaChuong = chuong.MaChuong,
                TenChuong = chuong.TenChuong,
                ThuTu = chuong.ThuTu,
            };
        }

        // ===== CẬP NHẬT CHƯƠNG =====
        public async Task<bool> CapNhatChuongAsync(int maChuong, int maGiangVien, ChuongHocCreateUpdateDTO dto)
        {
            var chuong = await _repository.GetChuongWithKhoaHocAsync(maChuong);
            if (chuong == null) return false;
            if (chuong.KhoaHoc.MaGiangVien != maGiangVien) return false;

            chuong.TenChuong = dto.TenChuong;
            chuong.ThuTu = dto.ThuTu;

            await _repository.UpdateChuongAsync(chuong);
            await _repository.SaveChangesAsync();
            return true;
        }

        // ===== XÓA CHƯƠNG =====
        public async Task<bool> XoaChuongAsync(int maChuong, int maGiangVien)
        {
            var chuong = await _repository.GetChuongWithKhoaHocAsync(maChuong);
            if (chuong == null) return false;

            if (chuong.KhoaHoc.MaGiangVien != maGiangVien) return false;

            await _repository.DeleteChuongAsync(chuong);
            await _repository.SaveChangesAsync();
            return true;
        }

        // ===== THÊM VIDEO =====
        public async Task<ThemVideoResponseDTO> ThemVideoAsync(int maChuong, int maGiangVien, BaiHocVideoCreateUpdateDTO dto)
        {
            var chuong = await _repository.GetChuongWithKhoaHocAsync(maChuong);
            if (chuong == null || chuong.KhoaHoc.MaGiangVien != maGiangVien)
                throw new UnauthorizedAccessException("Không có quyền thêm video vào chương này.");

            var baiHoc = new BaiHocModel
            {
                MaChuong = maChuong,
                TieuDe = dto.TieuDe,
                LinkVideo = dto.LinkVideo,
                ThoiLuong = dto.ThoiLuong,
                ThuTu = dto.ThuTu,
                LoaiBaiHoc = "Video",
            };

            await _repository.AddBaiHocAsync(baiHoc);
            await _repository.SaveChangesAsync();

            return new ThemVideoResponseDTO
            {
                MaBaiHoc = baiHoc.MaBaiHoc,
                TieuDe = baiHoc.TieuDe,
                LinkVideo = baiHoc.LinkVideo,
                ThoiLuong = baiHoc.ThoiLuong ?? 0,
                ThuTu = baiHoc.ThuTu,
            };
        }

        // ===== CẬP NHẬT VIDEO =====
        public async Task<bool> CapNhatVideoAsync(int maBaiHoc, int maGiangVien, BaiHocVideoCreateUpdateDTO dto)
        {
            var baiHoc = await _repository.GetBaiHocWithChuongAsync(maBaiHoc);
            if (baiHoc == null) return false;

            if (baiHoc.ChuongHoc.KhoaHoc.MaGiangVien != maGiangVien) return false;

            baiHoc.TieuDe = dto.TieuDe;
            baiHoc.LinkVideo = dto.LinkVideo;
            baiHoc.ThoiLuong = dto.ThoiLuong;
            baiHoc.ThuTu = dto.ThuTu;

            await _repository.UpdateBaiHocAsync(baiHoc);
            await _repository.SaveChangesAsync();
            return true;
        }

        // ===== XÓA VIDEO =====
        public async Task<bool> XoaVideoAsync(int maBaiHoc, int maGiangVien)
        {
            var baiHoc = await _repository.GetBaiHocWithChuongAsync(maBaiHoc);
            if (baiHoc == null) return false;

            if (baiHoc.ChuongHoc.KhoaHoc.MaGiangVien != maGiangVien) return false;

            await _repository.DeleteBaiHocAsync(baiHoc);
            await _repository.SaveChangesAsync();
            return true;
        }
    }
}

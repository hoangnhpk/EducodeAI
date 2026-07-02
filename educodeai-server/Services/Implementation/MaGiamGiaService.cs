using educodeai_server.Data;
using educodeai_server.DTOs.MaGiamGia;
using educodeai_server.Models;
using educodeai_server.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Services.Implementation
{
    public class MaGiamGiaService : IMaGiamGiaService
    {
        private readonly EduCodeAIDbContext _db;

        public MaGiamGiaService(EduCodeAIDbContext db)
        {
            _db = db;
        }

        public Task<MaGiamGiaItemDTO> TaoMaGiamGiaChoAdminAsync(TaoMaGiamGiaDTO yeuCau, int maAdmin)
            => TaoMaGiamGiaAsync(yeuCau, maAdmin, "ADMIN");

        public Task<MaGiamGiaItemDTO> TaoMaGiamGiaChoGiangVienAsync(TaoMaGiamGiaDTO yeuCau, int maGiangVien)
            => TaoMaGiamGiaAsync(yeuCau, maGiangVien, "TEACHER");

        public async Task<IReadOnlyList<MaGiamGiaItemDTO>> LayDanhSachChoAdminAsync()
        {
            var duLieu = await _db.MaGiamGias
                .AsNoTracking()
                .Include(x => x.DanhSachKhoaHocApDung)
                .OrderByDescending(x => x.MaVoucher)
                .ToListAsync();
            return duLieu.Select(MapItem).ToList();
        }

        public async Task<IReadOnlyList<MaGiamGiaItemDTO>> LayDanhSachChoGiangVienAsync(int maGiangVien)
        {
            var duLieu = await _db.MaGiamGias
                .AsNoTracking()
                .Include(x => x.DanhSachKhoaHocApDung)
                .Where(x => x.MaNguoiTao == maGiangVien && x.LoaiNguoiTao == "TEACHER")
                .OrderByDescending(x => x.MaVoucher)
                .ToListAsync();
            return duLieu.Select(MapItem).ToList();
        }

        public async Task<IReadOnlyList<KhoaHocApDungOptionDTO>> LayKhoaHocChoAdminAsync()
        {
            return await _db.KhoaHocs
                .AsNoTracking()
                .Where(x => x.TrangThai != "Đã xóa" && x.TrangThai != "Deleted")
                .OrderByDescending(x => x.NgayTao)
                .Select(x => new KhoaHocApDungOptionDTO
                {
                    MaKhoaHoc = x.MaKhoaHoc,
                    TenKhoaHoc = x.TenKhoaHoc,
                    MaGiangVien = x.MaGiangVien
                })
                .ToListAsync();
        }

        public async Task<IReadOnlyList<KhoaHocApDungOptionDTO>> LayKhoaHocChoGiangVienAsync(int maGiangVien)
        {
            return await _db.KhoaHocs
                .AsNoTracking()
                .Where(x => x.MaGiangVien == maGiangVien && x.TrangThai != "Đã xóa" && x.TrangThai != "Deleted")
                .OrderByDescending(x => x.NgayTao)
                .Select(x => new KhoaHocApDungOptionDTO
                {
                    MaKhoaHoc = x.MaKhoaHoc,
                    TenKhoaHoc = x.TenKhoaHoc,
                    MaGiangVien = x.MaGiangVien
                })
                .ToListAsync();
        }

        private async Task<MaGiamGiaItemDTO> TaoMaGiamGiaAsync(TaoMaGiamGiaDTO yeuCau, int maNguoiTao, string loaiNguoiTao)
        {
            string code = yeuCau.Code.Trim().ToUpperInvariant();
            if (await _db.MaGiamGias.AnyAsync(x => x.Code == code))
            {
                throw new ApplicationException("Mã giảm giá đã tồn tại.");
            }

            if (yeuCau.KetThucAt <= yeuCau.BatDauAt)
            {
                throw new ApplicationException("Thời gian kết thúc phải sau thời gian bắt đầu.");
            }

            string loai = yeuCau.LoaiGiamGia.Trim().ToUpperInvariant();
            if (loai is not ("PERCENT" or "FIXED"))
            {
                throw new ApplicationException("Loại giảm giá không hợp lệ.");
            }

            if (loai == "PERCENT")
            {
                if (yeuCau.GiaTriGiam <= 0 || yeuCau.GiaTriGiam > 100)
                {
                    throw new ApplicationException("Giảm theo phần trăm phải trong khoảng (0, 100].");
                }
            }
            else if (yeuCau.GiaTriGiam <= 0)
            {
                throw new ApplicationException("Giá trị giảm phải lớn hơn 0.");
            }

            var dsKhoaHoc = yeuCau.DanhSachMaKhoaHoc.Distinct().ToList();
            if (!yeuCau.ApDungTatCaKhoaHocCuaGiangVien && dsKhoaHoc.Count == 0)
            {
                throw new ApplicationException("Vui lòng chọn ít nhất 1 khóa học áp dụng.");
            }

            if (loaiNguoiTao == "TEACHER")
            {
                if (yeuCau.ApDungTatCaKhoaHocCuaGiangVien)
                {
                    dsKhoaHoc = await _db.KhoaHocs
                        .AsNoTracking()
                        .Where(x => x.MaGiangVien == maNguoiTao && x.TrangThai != "Đã xóa" && x.TrangThai != "Deleted")
                        .Select(x => x.MaKhoaHoc)
                        .ToListAsync();
                }
                else
                {
                    var soHopLe = await _db.KhoaHocs
                        .AsNoTracking()
                        .CountAsync(x => dsKhoaHoc.Contains(x.MaKhoaHoc) && x.MaGiangVien == maNguoiTao);
                    if (soHopLe != dsKhoaHoc.Count)
                    {
                        throw new ApplicationException("Giảng viên chỉ được tạo mã cho khóa học của chính mình.");
                    }
                }
            }
            else
            {
                if (yeuCau.ApDungTatCaKhoaHocCuaGiangVien)
                {
                    throw new ApplicationException("Admin vui lòng chọn cụ thể khóa học áp dụng.");
                }

                var soHopLe = await _db.KhoaHocs.AsNoTracking().CountAsync(x => dsKhoaHoc.Contains(x.MaKhoaHoc));
                if (soHopLe != dsKhoaHoc.Count)
                {
                    throw new ApplicationException("Danh sách khóa học áp dụng không hợp lệ.");
                }
            }

            var voucher = new MaGiamGiaModel
            {
                Code = code,
                TenChuongTrinh = yeuCau.TenChuongTrinh.Trim(),
                LoaiGiamGia = loai,
                GiaTriGiam = yeuCau.GiaTriGiam,
                GiamToiDa = loai == "PERCENT" ? yeuCau.GiamToiDa : null,
                DonHangToiThieu = 0,
                MaNguoiTao = maNguoiTao,
                LoaiNguoiTao = loaiNguoiTao,
                PhamViApDung = yeuCau.ApDungTatCaKhoaHocCuaGiangVien ? "ALL_TEACHER_COURSES" : "SPECIFIC_COURSES",
                ChoPhepApDungChoQuaTang = true,
                SoLuongToiDa = yeuCau.SoLuongToiDa,
                SoLuongDaDung = 0,
                KichHoat = true,
                BatDauAt = DateTime.SpecifyKind(yeuCau.BatDauAt, DateTimeKind.Utc),
                KetThucAt = DateTime.SpecifyKind(yeuCau.KetThucAt, DateTimeKind.Utc)
            };
            _db.MaGiamGias.Add(voucher);
            await _db.SaveChangesAsync();

            if (dsKhoaHoc.Count > 0)
            {
                _db.MaGiamGiaKhoaHocs.AddRange(dsKhoaHoc.Select(maKhoaHoc => new MaGiamGiaKhoaHocModel
                {
                    MaVoucher = voucher.MaVoucher,
                    MaKhoaHoc = maKhoaHoc
                }));
                await _db.SaveChangesAsync();
            }

            voucher = await _db.MaGiamGias.AsNoTracking()
                .Include(x => x.DanhSachKhoaHocApDung)
                .FirstAsync(x => x.MaVoucher == voucher.MaVoucher);
            return MapItem(voucher);
        }

        private static MaGiamGiaItemDTO MapItem(MaGiamGiaModel x) => new()
        {
            MaVoucher = x.MaVoucher,
            Code = x.Code,
            TenChuongTrinh = x.TenChuongTrinh,
            LoaiGiamGia = x.LoaiGiamGia,
            GiaTriGiam = x.GiaTriGiam,
            GiamToiDa = x.GiamToiDa,
            SoLuongToiDa = x.SoLuongToiDa,
            SoLuongDaDung = x.SoLuongDaDung,
            KichHoat = x.KichHoat,
            BatDauAt = x.BatDauAt,
            KetThucAt = x.KetThucAt,
            PhamViApDung = x.PhamViApDung,
            DanhSachMaKhoaHoc = x.DanhSachKhoaHocApDung.Select(k => k.MaKhoaHoc).ToList()
        };
    }
}

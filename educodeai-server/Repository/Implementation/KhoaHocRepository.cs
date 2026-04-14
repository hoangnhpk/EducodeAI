using Microsoft.EntityFrameworkCore;
using educodeai_server.Repository.Interface;
using educodeai_server.Data;
using educodeai_server.Models;
using educodeai_server.DTOs.AI;
using educodeai_server.DTOs.KhoaHoc;
using System.Text.Json;

namespace educodeai_server.Repository.Implementation
{
    public class KhoaHocRepository : IKhoaHocRepository
    {
        private readonly EduCodeAIDbContext _context;

        public KhoaHocRepository(EduCodeAIDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<KhoaHocDto>> GetAllKhoaHocsAsync(int maNguoiDung)
        {
            try
            {
                return await _context.KhoaHocs
                    .Where(x => x.TrangThai == "Hoạt động")
                    .OrderByDescending(x => x.NgayTao)
                    .Select(x => new KhoaHocDto
                    {
                        MaKhoaHoc = x.MaKhoaHoc,
                        TenKhoaHoc = x.TenKhoaHoc,
                        Slug = SlugHelper.Generate(x.TenKhoaHoc),
                        HinhAnh = x.HinhAnh,
                        LinhVuc = x.LinhVuc,
                        DiemDanhGiaTB = x.DiemDanhGiaTB,
                        ThoiLuongGio = x.ThoiLuongGio,
                        TrinhDo = x.TrinhDo,
                        KyNangChinh = x.KyNangChinh,
                        KhoaHocDaDangKy = maNguoiDung > 0
                              ? _context.DangKyKhoaHocs.Any(dk => dk.MaKhoaHoc == x.MaKhoaHoc && dk.MaNguoiDung == maNguoiDung)
                              : false
                    })
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Lỗi khi lấy danh sách khóa học trang chủ.", ex);
            }
        }

        public async Task<List<KhoaHocAISnapshotDto>> GetKhoaHocTheoKeywordAsync(List<string> keywords)
        {
            try
            {
                var query = _context.KhoaHocs
                .Where(x => x.TrangThai == "Hoạt động");

                if (keywords.Any())
                {
                    query = query.Where(kh =>
                        keywords.Any(k =>
                            kh.TenKhoaHoc.ToLower().Contains(k) ||
                            kh.LinhVuc.ToLower().Contains(k) ||
                            kh.KyNangChinh.ToLower().Contains(k)
                        ));
                }

                return await query
                    .OrderByDescending(x => x.DiemDanhGiaTB)
                    .ThenByDescending(x => x.NgayTao)
                    .Select(x => new KhoaHocAISnapshotDto
                    {
                        MaKhoaHoc = x.MaKhoaHoc,
                        TenKhoaHoc = x.TenKhoaHoc,
                        TrinhDo = x.TrinhDo,
                        LinhVuc = x.LinhVuc,
                        KyNangChinh = x.KyNangChinh,
                        ThoiLuongGio = x.ThoiLuongGio
                    })
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Lỗi khi lấy khóa học theo từ khóa.", ex);
            }
        }

        // 2. LẤY CHI TIẾT KHÓA HỌC
        public async Task<KhoaHocModel?> GetKhoaHocWithDetailsAsync(int maKhoaHoc)
        {
            return await _context.KhoaHocs
                .Include(k => k.DangKyKhoaHocs)
                    .ThenInclude(d => d.NguoiDung)
                .FirstOrDefaultAsync(k => k.MaKhoaHoc == maKhoaHoc);
        }

        // 3. Lấy danh sách khóa học theo giảng viên
        public async Task<List<KhoaHocModel>> GetKhoaHocsByGiangVienAsync(int maGiangVien)
        {
            return await _context.KhoaHocs
                .Include(k => k.DangKyKhoaHocs)
                .Where(k => k.MaGiangVien == maGiangVien)
                .OrderByDescending(k => k.NgayTao)
                .ToListAsync();
        }

        public async Task<KhoaHoc_NoiDungKhoaHocDTO?> GetNoiDungKhoaHocAsync(int maKhoaHoc, int maNguoiDung)
        {
            return await _context.KhoaHocs
                .AsNoTracking()
                .Where(kh => kh.MaKhoaHoc == maKhoaHoc)
                .Select(kh => new KhoaHoc_NoiDungKhoaHocDTO
                {
                    MaKhoaHoc = kh.MaKhoaHoc,
                    TenKhoaHoc = kh.TenKhoaHoc,
                    Slug = SlugHelper.Generate(kh.TenKhoaHoc),
                    DanhSachChuongHoc = kh.ChuongHocs
                        .OrderBy(ch => ch.ThuTu)
                        .Select(ch => new ChuongHoc_NoiDungKhoaHocDTO
                        {
                            Id = ch.MaChuong,
                            TieuDe = ch.TenChuong,
                            ThuTu = ch.ThuTu,
                            DanhSachBaiHoc = ch.BaiHocs
                                .OrderBy(bh => bh.ThuTu)
                                .Select(bh => new BaiHoc_NoiDungKhoaHocDTO
                                {
                                    Id = bh.MaBaiHoc,
                                    TieuDe = bh.TieuDe,
                                    LoaiBaiHoc = bh.LoaiBaiHoc,
                                    NoiDung = bh.NoiDung,
                                    ThoiLuong = bh.ThoiLuong,
                                    ThuTu = bh.ThuTu,
                                    LinkVideo = bh.LinkVideo,
                                    DaXem = bh.TienDoBaiHocs.Any(td => td.MaNguoiDung == maNguoiDung && td.DaXem),
                                    ThongTinQuiz = bh.BaiTaps
                                        .Where(bt => bt.BaiTap_Quiz != null)
                                        .Select(bt => new BaiTapQuizDTO
                                        {
                                            MaBaiTapQuiz = bt.BaiTap_Quiz.MaBaiTapQuiz,
                                            MaBaiTap = bt.MaBaiTap,
                                            ThoiGianLamBai = bt.BaiTap_Quiz.ThoiGianLamBai,
                                            DiemCanDat = bt.BaiTap_Quiz.DiemCanDat,
                                            ChoPhepLamLai = bt.BaiTap_Quiz.ChoPhepLamLai,
                                            DaoCauHoi = bt.BaiTap_Quiz.DaoCauHoi,
                                            DuLieuCauHoiJSON = bt.BaiTap_Quiz.DuLieuCauHoi
                                        }).FirstOrDefault()
                                }).ToList()
                        }).ToList()
                }).FirstOrDefaultAsync();
        }

        // 5. Các hàm hỗ trợ AI
        public async Task<List<KhoaHocAISnapshotDto>> GetKhoaHocPhuHopAsync(CreateLoTrinhAIDto dto)
        {
            var query = _context.KhoaHocs.Where(x => x.TrangThai == "Hoạt động");
            if (!string.IsNullOrEmpty(dto.TrinhDoHienTai))
            {
                query = query.Where(x => x.TrinhDo.Contains(dto.TrinhDoHienTai) || dto.TrinhDoHienTai.Contains(x.TrinhDo));
            }
            return await query.Select(x => new KhoaHocAISnapshotDto { MaKhoaHoc = x.MaKhoaHoc, TenKhoaHoc = x.TenKhoaHoc, TrinhDo = x.TrinhDo, LinhVuc = x.LinhVuc, KyNangChinh = x.KyNangChinh, ThoiLuongGio = x.ThoiLuongGio }).ToListAsync();
        }

        public async Task<List<DangKyKhoaHocModel>> GetDangKyKhoaHocAsync(int maNguoiDung)
        {
            return await _context.DangKyKhoaHocs
                .Where(x => x.MaNguoiDung == maNguoiDung)
                .ToListAsync();
        }

        public async Task<List<int>> GetMaKhoaHocDaDangKyAsync(int maNguoiDung, List<int> danhSachMaKhoaHoc)
        {
            return await _context.DangKyKhoaHocs
                .Where(x => x.MaNguoiDung == maNguoiDung
                         && danhSachMaKhoaHoc.Contains(x.MaKhoaHoc))
                .Select(x => x.MaKhoaHoc)
                .ToListAsync();
        }

        public async Task AddDangKyKhoaHocAsync(List<DangKyKhoaHocModel> dangKyKhoaHocs)
        {
            await _context.DangKyKhoaHocs.AddRangeAsync(dangKyKhoaHocs);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> LuuTienDoBaiHoc(TienDoBaiHocDTO dto)
        {
            try
            {
                var tienDo = await _context.TienDoBaiHocs
                    .FirstOrDefaultAsync(td =>
                        td.MaBaiHoc == dto.MaBaiHoc &&
                        td.MaNguoiDung == dto.MaNguoiDung
                    );

                if (tienDo != null)
                {
                    tienDo.DaXem = dto.DaXem;
                    tienDo.ThoiGianHoc = dto.ThoiGianHoc;
                    tienDo.NgayCapNhat = DateTime.Now;
                    _context.TienDoBaiHocs.Update(tienDo);
                }
                else
                {
                    tienDo = new TienDoBaiHocModel
                    {
                        MaBaiHoc = dto.MaBaiHoc,
                        MaNguoiDung = dto.MaNguoiDung,
                        DaXem = dto.DaXem,
                        ThoiGianHoc = dto.ThoiGianHoc,
                        NgayCapNhat = DateTime.Now
                    };

                    await _context.TienDoBaiHocs.AddAsync(tienDo);
                }

                // Lưu tiến độ bài học xuống DB trước
                bool isSaved = await _context.SaveChangesAsync() > 0;

                // 2. LOGIC KIỂM TRA BÀI CUỐI & CẬP NHẬT TRẠNG THÁI KHÓA HỌC

                if (isSaved && dto.DaXem == true)
                {
                    // Lấy ra mã khóa học từ bài học hiện tại
                    var baiHoc = await _context.BaiHocs
                        .Include(b => b.ChuongHoc)
                        .FirstOrDefaultAsync(b => b.MaBaiHoc == dto.MaBaiHoc);

                    if (baiHoc != null)
                    {
                        int maKhoaHoc = baiHoc.ChuongHoc.MaKhoaHoc;

                        // Đếm tổng số bài của khóa học
                        int tongSoBai = await _context.BaiHocs
                            .Where(b => b.ChuongHoc.MaKhoaHoc == maKhoaHoc)
                            .CountAsync();
                        // Đếm số bài đã học của user này
                        int soBaiDaHoc = await _context.TienDoBaiHocs
                            .Where(t => t.MaNguoiDung == dto.MaNguoiDung
                                     && t.BaiHoc.ChuongHoc.MaKhoaHoc == maKhoaHoc
                                     && t.DaXem == true)
                            .CountAsync();
                        // Tìm bản ghi đăng ký khóa học tương ứng
                        var dangKy = await _context.DangKyKhoaHocs
                            .FirstOrDefaultAsync(dk => dk.MaKhoaHoc == maKhoaHoc && dk.MaNguoiDung == dto.MaNguoiDung && dk.TrangThai == "DangHoc");

                        if (dangKy != null)
                        {
                            // Cập nhật % tiến độ (Tuỳ chọn nếu bảng DangKyKhoaHoc của bạn có lưu Tiến Độ dạng số)
                            dangKy.TienDo = tongSoBai > 0 ? (int)Math.Round((double)soBaiDaHoc / tongSoBai * 100) : 0;

                            // KIỂM TRA NẾU ĐÃ HỌC XONG BÀI CUỐI CÙNG (Số bài đã học = Tổng số bài)
                            if (tongSoBai > 0 && soBaiDaHoc == tongSoBai)
                            {
                                dangKy.TrangThai = "HoanThanh"; // Giả sử 2 là trạng thái "Đã hoàn thành" trong hệ thống của bạn
                            }
                            else
                            {
                                dangKy.TrangThai = "DangHoc"; // 1 là trạng thái "Đang học"
                            }

                            _context.DangKyKhoaHocs.Update(dangKy);
                            await _context.SaveChangesAsync(); 
                        }
                    }
                }

                return isSaved;
            }
            catch (DbUpdateException ex)
            {
                throw new ApplicationException("Không thể lưu tiến độ bài học. Vui lòng thử lại.", ex);
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Đã xảy ra lỗi khi lưu tiến độ bài học.", ex);
            }
        }

        public async Task<bool> LuuGhiChuBaiHoc(GhiChuBaiHocDTO dto)
        {
            if (dto == null) return false;
            try
            {
                var ghiChuTonTai = await _context.GhiChuBaiHocs
                    .FirstOrDefaultAsync(x => x.MaNguoiDung == dto.MaNguoiDung
                                           && x.MaBaiHoc == dto.MaBaiHoc
                                           && x.ThoiGianVideo == dto.ThoiGianVideo);

                if (ghiChuTonTai != null)
                {
                    ghiChuTonTai.NoiDung = dto.NoiDung;
                    ghiChuTonTai.NgayTao = DateTime.Now;
                    _context.GhiChuBaiHocs.Update(ghiChuTonTai);
                }
                else
                {
                    var duLieuMoi = new GhiChuBaiHocModel
                    {
                        MaNguoiDung = dto.MaNguoiDung,
                        MaBaiHoc = dto.MaBaiHoc,
                        ThoiGianVideo = dto.ThoiGianVideo,
                        NoiDung = dto.NoiDung,
                        NgayTao = DateTime.Now
                    };
                    await _context.GhiChuBaiHocs.AddAsync(duLieuMoi);
                }

                return await _context.SaveChangesAsync() > 0;
            }
            catch (DbUpdateException ex)
            {
                throw new ApplicationException("Lỗi cập nhật cơ sở dữ liệu khi lưu ghi chú.", ex);
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Đã xảy ra lỗi hệ thống khi xử lý ghi chú.", ex);
            }
        }

        public async Task<List<GhiChuBaiHocDTO>> GetGhiChuBaiHocAsync(int maBaiHoc, int maNguoiDung)
        {
            return await _context.GhiChuBaiHocs
                .Where(x => x.MaBaiHoc == maBaiHoc && x.MaNguoiDung == maNguoiDung)
                .Select(x => new GhiChuBaiHocDTO
                {
                    MaGhiChu = x.Id,
                    MaBaiHoc = x.MaBaiHoc,
                    MaNguoiDung = x.MaNguoiDung,
                    ThoiGianVideo = x.ThoiGianVideo,
                    NoiDung = x.NoiDung,
                    NgayTao = x.NgayTao
                })
                .ToListAsync();
        }

        public async Task<bool> LuuKetQuaBaiTap(KetQuaQuizSubmitDTO dto)
        {
            if (dto == null) return false;

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var duLieuLuuTru = new
                {
                    SoCauDung = dto.SoCauDung,
                    TongSoCau = dto.TongSoCau,
                    DiemSo = dto.DiemSo,
                    KetQua = dto.DaDat ? "Pass" : "Fail",
                    ThoiGianNop = DateTime.Now,
                    LichSuTraLoi = dto.ChiTietLamBai
                };

                var ketQuaMoi = new KetQuaLamBaiModel
                {
                    MaNguoiDung = dto.MaNguoiDung,
                    MaBaiTap = dto.MaBaiTap,
                    DiemSo = dto.DiemSo,
                    TrangThai = dto.DaDat,
                    NoiDungNopJSON = JsonSerializer.Serialize(duLieuLuuTru),
                    NgayNop = DateTime.Now
                };

                _context.KetQuaLamBais.Add(ketQuaMoi);
                await _context.SaveChangesAsync();

                if (dto.DaDat)
                {
                    var tienDo = await _context.TienDoBaiHocs
                        .FirstOrDefaultAsync(td => td.MaBaiHoc == dto.MaBaiHoc
                                                && td.MaNguoiDung == dto.MaNguoiDung);

                    if (tienDo == null)
                    {
                        tienDo = new TienDoBaiHocModel
                        {
                            MaBaiHoc = dto.MaBaiHoc,
                            MaNguoiDung = dto.MaNguoiDung,
                            DaXem = true,
                            ThoiGianHoc = 100, // 100%
                            NgayCapNhat = DateTime.Now
                        };
                        _context.TienDoBaiHocs.Add(tienDo);
                    }
                    else
                    {
                        if (!tienDo.DaXem)
                        {
                            tienDo.DaXem = true;
                            tienDo.ThoiGianHoc = 100;
                        }
                        tienDo.NgayCapNhat = DateTime.Now;
                        _context.TienDoBaiHocs.Update(tienDo);
                    }

                    await _context.SaveChangesAsync();
                }

                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();

                Console.WriteLine($"Lỗi khi lưu kết quả bài tập: {ex.Message}");
                return false;
            }
        }


        public async Task<List<GhiChuAIModel>> LayDanhSachGhiChuAI(int maNguoiDung)
        {
            return await _context.GhiChuAIs
                .Include(g => g.BaiHoc)
                .Where(g => g.MaNguoiDung == maNguoiDung)
                .OrderByDescending(g => g.NgayTao)
                .ToListAsync();
        }

        public async Task<bool> LuuGhiChuAI(GhiChuAIModel duLieu)
        {
            _context.GhiChuAIs.Add(duLieu);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateGhiChuAI(int id, string noiDung)
        {
            var ghiChu = await _context.GhiChuAIs.FindAsync(id);
            if (ghiChu == null) return false;

            ghiChu.NoiDung = noiDung;
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteGhiChuAI(int id)
        {
            var ghiChu = await _context.GhiChuAIs.FindAsync(id);
            if (ghiChu == null) return false;

            _context.GhiChuAIs.Remove(ghiChu);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<List<DanhGiaModel>> LayDanhSachTheoKhoaHocAsync(int maKhoaHoc, int maNguoiDung)
        {
            return await _context.DanhGias
                .AsNoTracking()
                .Include(d => d.NguoiDung)
                .Where(d => d.MaKhoaHoc == maKhoaHoc
                    && (d.TrangThai == "DaDuyet" || d.MaNguoiDung == maNguoiDung))
                .OrderByDescending(d => d.NgayDanhGia)
                .ToListAsync();
        }

        public async Task<bool> KiemTraDaDanhGiaAsync(int maKhoaHoc, int maNguoiDung)
        {
            return await _context.DanhGias
                .AnyAsync(d => d.MaKhoaHoc == maKhoaHoc && d.MaNguoiDung == maNguoiDung);
        }

        public async Task<bool> ThemDanhGiaAsync(DanhGiaModel danhGia)
        {
            _context.DanhGias.Add(danhGia);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> KiemTraHoanThanhKhoaHocAsync(int maKhoaHoc, int maNguoiDung)
        {
            var tongSoBaiHoc = await _context.BaiHocs
                .Where(b => b.ChuongHoc.MaKhoaHoc == maKhoaHoc)
                .CountAsync();

            if (tongSoBaiHoc == 0) return false;

            var soBaiDaHoc = await _context.TienDoBaiHocs
                .Where(t => t.MaNguoiDung == maNguoiDung
                         && t.BaiHoc.ChuongHoc.MaKhoaHoc == maKhoaHoc
                         && t.DaXem == true)
                .CountAsync();

            return soBaiDaHoc == tongSoBaiHoc;
        }
    }
}

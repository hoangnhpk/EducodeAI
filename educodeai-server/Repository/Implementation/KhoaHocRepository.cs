using Microsoft.EntityFrameworkCore;
using educodeai_server.Repository.Interface;
using educodeai_server.Data;
using educodeai_server.Models;
using educodeai_server.DTOs.AI;
using educodeai_server.DTOs.KhoaHoc;
using educodeai_server.Helpers;
using System.ComponentModel.DataAnnotations;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.DependencyInjection;

namespace educodeai_server.Repository.Implementation
{
    public class KhoaHocRepository : IKhoaHocRepository
    {
        private readonly EduCodeAIDbContext _context;
        private const int HeSoSinhIdCauHoi = 100000;

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
                        GiaKhoaHoc = x.GiaKhoaHoc,
                        DonViTienTe = x.DonViTienTe,
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
            var duLieuKhoaHoc = await _context.KhoaHocs
                .AsNoTracking()
                .Where(kh => kh.MaKhoaHoc == maKhoaHoc)
                .Select(kh => new KhoaHoc_NoiDungKhoaHocDTO
                {
                    MaKhoaHoc = kh.MaKhoaHoc,
                    TenKhoaHoc = kh.TenKhoaHoc,
                    Slug = SlugHelper.Generate(kh.TenKhoaHoc),
                    CoChungChi = kh.CoChungChi,
                    TenChungChi = kh.TenChungChi,
                    GiaKhoaHoc = kh.GiaKhoaHoc,
                    DonViTienTe = kh.DonViTienTe,
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
                                    VideoSource = bh.VideoSource,
                                    VideoPublicId = bh.VideoPublicId,
                                    VideoStatus = bh.VideoStatus,
                                    HasSubtitle = bh.HasSubtitle,
                                    SubtitleUrl = bh.SubtitleUrl,
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
                                        }).FirstOrDefault(),
                                    MaBaiTapThucHanh = bh.BaiTaps
                                        .Where(bt => bt.BaiTapThucHanh != null)
                                        .Select(bt => (int?)bt.MaBaiTap)
                                        .FirstOrDefault()
                                }).ToList()
                        }).ToList()
                }).FirstOrDefaultAsync();

            if (duLieuKhoaHoc == null)
            {
                return null;
            }

            var daHoanThanhKhoaHoc = maNguoiDung > 0 && await KiemTraHoanThanhKhoaHocAsync(maKhoaHoc, maNguoiDung);
            var khoaHoc = await _context.KhoaHocs
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.MaKhoaHoc == maKhoaHoc);

            if (khoaHoc == null)
            {
                return duLieuKhoaHoc;
            }

            var nganHangCauHoi = await LayNganHangCauHoiChungChiAsync(khoaHoc);

            duLieuKhoaHoc.BaiKiemTraChungChi = khoaHoc.CoChungChi
                ? TaoBaiKiemTraChungChi(duLieuKhoaHoc, khoaHoc, nganHangCauHoi, daHoanThanhKhoaHoc)
                : null;
            duLieuKhoaHoc.ThongTinChungChi = khoaHoc.CoChungChi && maNguoiDung > 0
                ? await LayThongTinChungChiAsync(khoaHoc, maNguoiDung, nganHangCauHoi.Count)
                : new ThongTinChungChiDTO
                {
                    DaCap = false,
                    TongSoCauHoi = nganHangCauHoi.Count,
                    TenKhoaHoc = duLieuKhoaHoc.TenKhoaHoc,
                    TenChungChi = khoaHoc.TenChungChi
                };

            return duLieuKhoaHoc;
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

        public async Task<KetQuaNopBaiKiemTraChungChiDTO> NopBaiKiemTraChungChiAsync(NopBaiKiemTraChungChiDTO dto)
        {
            if (dto == null)
            {
                return new KetQuaNopBaiKiemTraChungChiDTO
                {
                    ThanhCong = false,
                    ThongBao = "Dữ liệu bài kiểm tra không hợp lệ."
                };
            }

            dto.HoTenHienThi = dto.HoTenHienThi?.Trim() ?? string.Empty;
            dto.EmailNhan = dto.EmailNhan?.Trim() ?? string.Empty;

            if (string.IsNullOrWhiteSpace(dto.HoTenHienThi))
            {
                return new KetQuaNopBaiKiemTraChungChiDTO
                {
                    ThanhCong = false,
                    ThongBao = "Vui lòng nhập họ và tên hiển thị trên chứng chỉ."
                };
            }

            if (!new EmailAddressAttribute().IsValid(dto.EmailNhan))
            {
                return new KetQuaNopBaiKiemTraChungChiDTO
                {
                    ThanhCong = false,
                    ThongBao = "Email nhận chứng chỉ không hợp lệ."
                };
            }

            var daHoanThanhKhoaHoc = await KiemTraHoanThanhKhoaHocAsync(dto.MaKhoaHoc, dto.MaNguoiDung);
            if (!daHoanThanhKhoaHoc)
            {
                return new KetQuaNopBaiKiemTraChungChiDTO
                {
                    ThanhCong = false,
                    ThongBao = "Bạn cần hoàn thành toàn bộ khóa học trước khi thi nhận chứng chỉ."
                };
            }

            var khoaHoc = await _context.KhoaHocs
                .FirstOrDefaultAsync(x => x.MaKhoaHoc == dto.MaKhoaHoc);

            if (khoaHoc == null)
            {
                return new KetQuaNopBaiKiemTraChungChiDTO
                {
                    ThanhCong = false,
                    ThongBao = "Không tìm thấy khóa học."
                };
            }

            if (!khoaHoc.CoChungChi)
            {
                return new KetQuaNopBaiKiemTraChungChiDTO
                {
                    ThanhCong = false,
                    ThongBao = "Khóa học này không áp dụng chứng chỉ."
                };
            }

            var nganHangCauHoi = await LayNganHangCauHoiChungChiAsync(khoaHoc);
            if (nganHangCauHoi.Count == 0)
            {
                return new KetQuaNopBaiKiemTraChungChiDTO
                {
                    ThanhCong = false,
                    ThongBao = "Khóa học này chưa có đề kiểm tra chứng chỉ sẵn sàng."
                };
            }

            var bangTraLoi = dto.ChiTietLamBai
                .GroupBy(x => x.IdCauHoi)
                .ToDictionary(g => g.Key, g => g.Last().IndexLuaChon);

            var tongSoCau = nganHangCauHoi.Count;
            var soCauDung = nganHangCauHoi.Count(cauHoi =>
                bangTraLoi.TryGetValue(cauHoi.Id, out var luaChon)
                && luaChon == ChuyenDapAnDungSangIndex(cauHoi.DapAnDung));

            var diemSo = tongSoCau > 0
                ? Math.Round((double)soCauDung / tongSoCau * 100, 2)
                : 0;
            var daDat = diemSo >= khoaHoc.DiemDatChungChi;
            var thongBao = daDat
                ? "Bạn đã đạt yêu cầu và chứng chỉ đã được phát hành."
                : "Bạn chưa đạt ngưỡng nhận chứng chỉ. Hãy ôn tập và thử lại.";

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var ketQuaThi = new KetQuaKiemTraChungChiModel
                {
                    MaKhoaHoc = dto.MaKhoaHoc,
                    MaNguoiDung = dto.MaNguoiDung,
                    DiemSo = diemSo,
                    SoCauDung = soCauDung,
                    TongSoCau = tongSoCau,
                    DaDat = daDat,
                    ChiTietLamBaiJSON = JsonSerializer.Serialize(new
                    {
                        dto.ChiTietLamBai,
                        TongSoCau = tongSoCau,
                        SoCauDung = soCauDung,
                        DiemSo = diemSo,
                        NgayThi = DateTime.UtcNow
                    }),
                    NgayThi = DateTime.UtcNow
                };

                _context.KetQuaKiemTraChungChis.Add(ketQuaThi);
                await _context.SaveChangesAsync();

                if (daDat)
                {
                    var chungChi = await _context.ChungChiKhoaHocs
                        .FirstOrDefaultAsync(x => x.MaKhoaHoc == dto.MaKhoaHoc && x.MaNguoiDung == dto.MaNguoiDung);
                    var ngayCap = DateTime.UtcNow;

                    if (chungChi == null)
                    {
                        chungChi = new ChungChiKhoaHocModel
                        {
                            MaKhoaHoc = dto.MaKhoaHoc,
                            MaNguoiDung = dto.MaNguoiDung,
                            MaChungChi = TaoMaChungChi(dto.MaKhoaHoc, dto.MaNguoiDung),
                            MaKetQuaKiemTraChungChi = ketQuaThi.MaKetQuaKiemTraChungChi,
                            HoTenHienThi = dto.HoTenHienThi,
                            EmailNhan = dto.EmailNhan,
                            NgayCap = ngayCap
                        };
                        _context.ChungChiKhoaHocs.Add(chungChi);
                    }
                    else
                    {
                        chungChi.MaKetQuaKiemTraChungChi = ketQuaThi.MaKetQuaKiemTraChungChi;
                        chungChi.HoTenHienThi = dto.HoTenHienThi;
                        chungChi.EmailNhan = dto.EmailNhan;
                        chungChi.NgayCap = ngayCap;
                        _context.ChungChiKhoaHocs.Update(chungChi);
                    }
                    await _context.SaveChangesAsync();

                    thongBao = "Bạn đã đạt yêu cầu. Chứng chỉ đang được tạo và gửi bản PDF về email của bạn trong ít phút.";
                }

                await transaction.CommitAsync();

                return new KetQuaNopBaiKiemTraChungChiDTO
                {
                    ThanhCong = true,
                    DaDat = daDat,
                    DiemSo = diemSo,
                    SoCauDung = soCauDung,
                    TongSoCau = tongSoCau,
                    ThongBao = thongBao,
                    ThongTinChungChi = await LayThongTinChungChiAsync(khoaHoc, dto.MaNguoiDung, tongSoCau)
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();

                return new KetQuaNopBaiKiemTraChungChiDTO
                {
                    ThanhCong = false,
                    ThongBao = $"Không thể lưu kết quả bài kiểm tra chứng chỉ: {ex.Message}"
                };
            }
        }

        public async Task CapNhatTrangThaiGuiEmailChungChiAsync(int maKhoaHoc, int maNguoiDung, bool trangThai)
        {
            var chungChi = await _context.ChungChiKhoaHocs
                .FirstOrDefaultAsync(x => x.MaKhoaHoc == maKhoaHoc && x.MaNguoiDung == maNguoiDung);

            if (chungChi != null)
            {
                chungChi.DaGuiEmail = trangThai;
                if (trangThai)
                {
                    chungChi.NgayGuiEmail = DateTime.UtcNow;
                }
                await _context.SaveChangesAsync();
            }
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

        private BaiKiemTraChungChiDTO TaoBaiKiemTraChungChi(
            KhoaHoc_NoiDungKhoaHocDTO duLieuKhoaHoc,
            KhoaHocModel khoaHoc,
            List<CauHoiChungChiItem> nganHangCauHoi,
            bool daHoanThanhKhoaHoc)
        {
            return new BaiKiemTraChungChiDTO
            {
                MaBaiKiemTra = duLieuKhoaHoc.MaKhoaHoc * -1,
                TieuDe = khoaHoc.TenChungChi ?? $"Bài kiểm tra cuối khóa: {duLieuKhoaHoc.TenKhoaHoc}",
                MoTa = "Hoàn thành bài kiểm tra cuối khóa để mở khóa chứng chỉ. Bạn có thể thi lại nếu chưa đạt.",
                SoCauHoi = nganHangCauHoi.Count,
                ThoiGianLamBai = khoaHoc.ThoiGianLamBaiChungChi,
                DiemCanDat = khoaHoc.DiemDatChungChi,
                ChoPhepLamLai = true,
                DaoCauHoi = true,
                DaCoDeThi = nganHangCauHoi.Count > 0,
                NguonDe = khoaHoc.NguonDeChungChi,
                DuDieuKienDuThi = daHoanThanhKhoaHoc && nganHangCauHoi.Count > 0,
                LyDoChuaDuDieuKien = nganHangCauHoi.Count == 0
                    ? "Khóa học chưa có đề kiểm tra chứng chỉ. Vui lòng chờ giảng viên cấu hình."
                    : daHoanThanhKhoaHoc
                        ? null
                        : "Bạn cần hoàn thành 100% bài học trước khi bắt đầu bài kiểm tra.",
                DuLieuCauHoiJSON = JsonSerializer.Serialize(nganHangCauHoi)
            };
        }

        private async Task<ThongTinChungChiDTO> LayThongTinChungChiAsync(
            KhoaHocModel khoaHoc,
            int maNguoiDung,
            int tongSoCauHoi)
        {
            var thongTinHocVien = await _context.NguoiDungs
                .AsNoTracking()
                .Where(x => x.MaNguoiDung == maNguoiDung)
                .Select(x => new
                {
                    Ten = x.HoTen ?? x.TaiKhoan,
                    x.Email
                })
                .FirstOrDefaultAsync();

            var soLanThi = await _context.KetQuaKiemTraChungChis
                .AsNoTracking()
                .CountAsync(x => x.MaKhoaHoc == khoaHoc.MaKhoaHoc && x.MaNguoiDung == maNguoiDung);

            var lanThiGanNhat = await _context.KetQuaKiemTraChungChis
                .AsNoTracking()
                .Where(x => x.MaKhoaHoc == khoaHoc.MaKhoaHoc && x.MaNguoiDung == maNguoiDung)
                .OrderByDescending(x => x.NgayThi)
                .FirstOrDefaultAsync();

            var chungChi = await _context.ChungChiKhoaHocs
                .AsNoTracking()
                .Where(x => x.MaKhoaHoc == khoaHoc.MaKhoaHoc && x.MaNguoiDung == maNguoiDung)
                .OrderByDescending(x => x.NgayCap)
                .FirstOrDefaultAsync();

            return new ThongTinChungChiDTO
            {
                DaCap = chungChi != null,
                MaChungChi = chungChi?.MaChungChi,
                NgayCap = chungChi?.NgayCap,
                SoLanThi = soLanThi,
                DiemLanGanNhat = lanThiGanNhat?.DiemSo,
                DatLanGanNhat = lanThiGanNhat?.DaDat,
                SoCauDungLanGanNhat = lanThiGanNhat?.SoCauDung,
                TongSoCauHoi = tongSoCauHoi,
                TenHocVien = thongTinHocVien?.Ten,
                TenKhoaHoc = khoaHoc.TenKhoaHoc,
                TenChungChi = khoaHoc.TenChungChi,
                HoTenHienThi = chungChi?.HoTenHienThi ?? thongTinHocVien?.Ten,
                EmailNhan = chungChi?.EmailNhan ?? thongTinHocVien?.Email,
                DaGuiEmail = chungChi?.DaGuiEmail ?? false,
                NgayGuiEmail = chungChi?.NgayGuiEmail
            };
        }

        private async Task<List<CauHoiChungChiItem>> LayNganHangCauHoiChungChiAsync(KhoaHocModel khoaHoc)
        {
            if (!string.IsNullOrWhiteSpace(khoaHoc.DuLieuDeChungChiJSON))
            {
                var tuDeChungChi = ParseCauHoiChungChi(khoaHoc.DuLieuDeChungChiJSON, khoaHoc.MaKhoaHoc * HeSoSinhIdCauHoi);
                if (tuDeChungChi.Count > 0)
                {
                    return tuDeChungChi;
                }
            }

            var quizCuaKhoaHoc = await _context.BaiTap_Quizs
                .AsNoTracking()
                .Where(x => x.BaiTap.BaiHoc.ChuongHoc.MaKhoaHoc == khoaHoc.MaKhoaHoc && !string.IsNullOrEmpty(x.DuLieuCauHoi))
                .Select(x => new
                {
                    x.MaBaiTap,
                    x.DuLieuCauHoi
                })
                .ToListAsync();

            var ketQua = new List<CauHoiChungChiItem>();

            foreach (var quiz in quizCuaKhoaHoc)
            {
                ketQua.AddRange(ParseCauHoiChungChi(quiz.DuLieuCauHoi, quiz.MaBaiTap * HeSoSinhIdCauHoi));
            }

            return ketQua
                .Select((cauHoi, index) =>
                {
                    cauHoi.Id = index + 1;
                    return cauHoi;
                })
                .ToList();
        }

        private static List<CauHoiChungChiItem> ParseCauHoiChungChi(string? json, int baseId)
        {
            if (string.IsNullOrWhiteSpace(json))
            {
                return new List<CauHoiChungChiItem>();
            }

            try
            {
                var danhSachCauHoi = JsonSerializer.Deserialize<List<CauHoiQuizRaw>>(json)
                    ?? new List<CauHoiQuizRaw>();

                return danhSachCauHoi
                    .Where(cauHoi => !string.IsNullOrWhiteSpace(cauHoi.CauHoi))
                    .Select((cauHoi, index) => new CauHoiChungChiItem
                    {
                        Id = baseId + index + 1,
                        CauHoi = cauHoi.CauHoi,
                        DapAnA = cauHoi.DapAnA,
                        DapAnB = cauHoi.DapAnB,
                        DapAnC = cauHoi.DapAnC,
                        DapAnD = cauHoi.DapAnD,
                        DapAnDung = cauHoi.DapAnDung,
                        GiaiThich = cauHoi.GiaiThich ?? string.Empty
                    })
                    .ToList();
            }
            catch
            {
                return new List<CauHoiChungChiItem>();
            }
        }

        private static int ChuyenDapAnDungSangIndex(string? dapAnDung)
        {
            return dapAnDung?.Trim().ToUpperInvariant() switch
            {
                "A" => 0,
                "B" => 1,
                "C" => 2,
                "D" => 3,
                _ => 0
            };
        }

        private static string TaoMaChungChi(int maKhoaHoc, int maNguoiDung)
        {
            return $"CC-{maKhoaHoc}-{maNguoiDung}-{DateTime.UtcNow:yyyyMMddHHmmss}";
        }



        private sealed class CauHoiQuizRaw
        {
            [JsonPropertyName("cauHoi")]
            public string CauHoi { get; set; } = string.Empty;

            [JsonPropertyName("dapAnA")]
            public string DapAnA { get; set; } = string.Empty;

            [JsonPropertyName("dapAnB")]
            public string DapAnB { get; set; } = string.Empty;

            [JsonPropertyName("dapAnC")]
            public string DapAnC { get; set; } = string.Empty;

            [JsonPropertyName("dapAnD")]
            public string DapAnD { get; set; } = string.Empty;

            [JsonPropertyName("dapAnDung")]
            public string DapAnDung { get; set; } = string.Empty;

            [JsonPropertyName("giaiThich")]
            public string? GiaiThich { get; set; }
        }

        private sealed class CauHoiChungChiItem
        {
            [JsonPropertyName("id")]
            public int Id { get; set; }

            [JsonPropertyName("cauHoi")]
            public string CauHoi { get; set; } = string.Empty;

            [JsonPropertyName("dapAnA")]
            public string DapAnA { get; set; } = string.Empty;

            [JsonPropertyName("dapAnB")]
            public string DapAnB { get; set; } = string.Empty;

            [JsonPropertyName("dapAnC")]
            public string DapAnC { get; set; } = string.Empty;

            [JsonPropertyName("dapAnD")]
            public string DapAnD { get; set; } = string.Empty;

            [JsonPropertyName("dapAnDung")]
            public string DapAnDung { get; set; } = string.Empty;

            [JsonPropertyName("giaiThich")]
            public string GiaiThich { get; set; } = string.Empty;
        }
    }
}

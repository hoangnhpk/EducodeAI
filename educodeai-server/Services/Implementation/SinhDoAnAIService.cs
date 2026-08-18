using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using educodeai_server.DTOs.AI;
using educodeai_server.Helpers;
using educodeai_server.Services.Interface;
using Microsoft.Extensions.Caching.Memory;

namespace educodeai_server.Services.Implementation
{
    /// <summary>
    /// Phiên phỏng vấn lưu tạm trong MemoryCache (không cần DB/migration).
    /// Key = "phongvan_{sessionId}"
    /// </summary>
    internal class PhienPhongVan
    {
        public string SessionId { get; set; } = string.Empty;
        public int MaDoAn { get; set; }
        public int MaNguoiDung { get; set; }
        public string TenDoAn { get; set; } = string.Empty;
        public string MoTa { get; set; } = string.Empty;
        public List<string> YeuCauChucNang { get; set; } = new();
        public string CauTrucDatabase { get; set; } = string.Empty;
        public string MucTieuNgheNghiep { get; set; } = string.Empty;
        public string NgonNguCongNghe { get; set; } = string.Empty;
        public string GhiChuThayDoi { get; set; } = string.Empty;
        public string KhoKhan { get; set; } = string.Empty;
        public string TienDoHoanThanh { get; set; } = string.Empty;
        public List<PhongVanTurnDto> LichSu { get; set; } = new();
        public string CauHoiHienTai { get; set; } = string.Empty;
        public int TongDiem { get; set; }
        public bool DaKetThuc { get; set; }
        public string? MaChungChi { get; set; }
    }

    public class SinhDoAnAIService : ISinhDoAnAIService
    {
        private readonly IGeminiAIService _gemini;
        private readonly IMemoryCache _cache;
        private readonly educodeai_server.Data.EduCodeAIDbContext _dbContext;
        private const int TONG_SO_CAU = 3;
        private const int DIEM_MOI_CAU = 20;
        private const int NGUONG_DAT = 50;

        public SinhDoAnAIService(IGeminiAIService gemini, IMemoryCache cache, educodeai_server.Data.EduCodeAIDbContext dbContext)
        {
            _gemini = gemini;
            _cache = cache;
            _dbContext = dbContext;
        }

        // ================================================================
        // CHỨC NĂNG CŨ: Sinh đồ án
        // ================================================================
        public async Task<SinhDoAnResponseDto> GenerateDoAnAsync(int maNguoiDung, SinhDoAnRequestDto request)
        {
            var prompt = $@"
Bạn là một Senior System Architect dày dặn kinh nghiệm.
Nhiệm vụ của bạn là thiết kế một đồ án thực tế dựa trên yêu cầu sau:
- Mục tiêu nghề nghiệp: {request.MucTieuNgheNghiep}
- Ngôn ngữ / Công nghệ: {request.NgonNguCongNghe}
- Cấp độ: {request.CapDo}

Hãy suy nghĩ và đưa ra:
1. Tên đồ án (ngắn gọn, chuyên nghiệp).
2. Mô tả ngắn về đồ án này (khoảng 1-2 câu).
3. Danh sách các yêu cầu chức năng cốt lõi. BẠN PHẢI CHIA CÁC CHỨC NĂNG THEO TỪNG NGÀY (Ngày 1, Ngày 2, ...). Mỗi ngày là một cụm tính năng. VỚI MỖI NGÀY, PHẢI CHỈ RÕ CHI TIẾT CÁC CÔNG VIỆC/CHỨC NĂNG CẦN LÀM.
4. Gợi ý 1 file cốt lõi nhất (VD: ProductController.cs, AuthService.cs, Program.cs) mà học viên cần nộp cho mỗi ngày để bạn chấm điểm phần đó.
5. Cấu trúc Database cơ bản cho các chức năng trên (trình bày dưới dạng pseudo-code hoặc mã JSON tuỳ theo công nghệ, ngắn gọn, dễ hiểu).

BẠN PHẢI TRẢ VỀ DỮ LIỆU ĐÚNG CHUẨN JSON VỚI ĐỊNH DẠNG SAU, VÀ KHÔNG KÈM THEO BẤT KỲ VĂN BẢN NÀO KHÁC BÊN NGOÀI:
{{
    ""TenDoAn"": ""Tên Đồ Án"",
    ""MoTa"": ""Mô tả ngắn gọn"",
    ""YeuCauChucNang"": [
        {{ ""Ngay"": 1, ""TenChucNang"": ""Ngày 1: Thiết lập dự án và Đăng nhập"", ""ChiTietYeuCau"": ""- Tạo project và config CSDL.\n- Viết API đăng ký, đăng nhập."", ""GoiYFileNop"": ""Program.cs"" }},
        {{ ""Ngay"": 2, ""TenChucNang"": ""Ngày 2: Quản lý sản phẩm (CRUD)"", ""ChiTietYeuCau"": ""- Tạo API thêm sửa xoá sản phẩm.\n- Xử lý phân trang."", ""GoiYFileNop"": ""ProductController.cs"" }}
    ],
    ""CauTrucDatabase"": ""// Collection Users\n{{ _id, name, email }}\n// Collection Products\n{{ _id, title, price }}""
}}
";
            var aiResult = await _gemini.GenerateAsync(prompt);
            var resultChuanHoa = ChuanHoaJsonTuAIHelper.ChuanHoa(aiResult);

            var responseDto = JsonSerializer.Deserialize<SinhDoAnResponseDto>(resultChuanHoa, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (responseDto == null)
                throw new Exception("Không thể parse kết quả từ AI thành JSON hợp lệ.");

            if (maNguoiDung > 0)
            {
                var newDoAn = new educodeai_server.Models.DoAnThucChienModel
                {
                    MaNguoiDung = maNguoiDung,
                    TenDoAn = (responseDto.TenDoAn ?? string.Empty).Length > 300 ? responseDto.TenDoAn.Substring(0, 300) : (responseDto.TenDoAn ?? string.Empty),
                    MoTa = (responseDto.MoTa ?? string.Empty).Length > 1000 ? responseDto.MoTa.Substring(0, 1000) : (responseDto.MoTa ?? string.Empty),
                    YeuCauChucNangJSON = responseDto.YeuCauChucNang != null ? JsonSerializer.Serialize(responseDto.YeuCauChucNang) : "[]",
                    CauTrucDatabaseText = responseDto.CauTrucDatabase ?? string.Empty,
                    MucTieuNgheNghiep = (request.MucTieuNgheNghiep ?? string.Empty).Length > 200 ? request.MucTieuNgheNghiep.Substring(0, 200) : (request.MucTieuNgheNghiep ?? string.Empty),
                    NgonNguCongNghe = (request.NgonNguCongNghe ?? string.Empty).Length > 200 ? request.NgonNguCongNghe.Substring(0, 200) : (request.NgonNguCongNghe ?? string.Empty),
                    TrangThai = educodeai_server.Models.TrangThaiDoAn.ChuaNop,
                    NgayNop = DateTime.UtcNow
                };
                try
                {
                    _dbContext.DoAnThucChiens.Add(newDoAn);
                    await _dbContext.SaveChangesAsync();
                    responseDto.MaDoAn = newDoAn.MaDoAn;
                }
                catch (Microsoft.EntityFrameworkCore.DbUpdateException ex)
                {
                    var innerMsg = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                    throw new Exception($"Lỗi DB: {innerMsg}");
                }
            }

            return responseDto;
        }

        // ================================================================
        // MỚI: Nộp đồ án → lưu vào Cache, AI sinh câu hỏi đầu tiên
        // ================================================================
        public async Task<NopDoAnResponseDto> NopDoAnAsync(int maNguoiDung, NopDoAnRequestDto request)
        {
            // Tạo session ID (dùng làm "maDoAn" tạm thời, không cần DB)
            var sessionId = Guid.NewGuid().ToString("N")[..12].ToUpper();

            var phien = new PhienPhongVan
            {
                SessionId    = sessionId,
                MaNguoiDung  = maNguoiDung,
                TenDoAn      = request.TenDoAn,
                MoTa         = request.MoTa,
                YeuCauChucNang = request.YeuCauChucNang,
                CauTrucDatabase = request.CauTrucDatabase,
                MucTieuNgheNghiep = request.MucTieuNgheNghiep,
                NgonNguCongNghe   = request.NgonNguCongNghe,
                GhiChuThayDoi     = request.GhiChuThayDoi,
                KhoKhan           = request.KhoKhan,
                TienDoHoanThanh   = request.TienDoHoanThanh,
            };

            // Tái sử dụng bản ghi đồ án đã sinh nếu bản ghi thuộc về học viên.
            educodeai_server.Models.DoAnThucChienModel? dbDoAn = null;
            if (request.MaDoAn.HasValue && request.MaDoAn.Value > 0)
            {
                dbDoAn = await _dbContext.DoAnThucChiens
                    .FirstOrDefaultAsync(x => x.MaDoAn == request.MaDoAn.Value && x.MaNguoiDung == maNguoiDung);

                if (dbDoAn == null)
                    throw new UnauthorizedAccessException("Đồ án không thuộc về tài khoản hiện tại.");
            }

            if (dbDoAn == null)
            {
                dbDoAn = new educodeai_server.Models.DoAnThucChienModel
                {
                    MaNguoiDung = maNguoiDung
                };
                _dbContext.DoAnThucChiens.Add(dbDoAn);
            }

            dbDoAn.TenDoAn = request.TenDoAn;
            dbDoAn.MoTa = request.MoTa;
            dbDoAn.YeuCauChucNangJSON = JsonSerializer.Serialize(request.YeuCauChucNang);
            dbDoAn.CauTrucDatabaseText = request.CauTrucDatabase;
            dbDoAn.MucTieuNgheNghiep = request.MucTieuNgheNghiep;
            dbDoAn.NgonNguCongNghe = request.NgonNguCongNghe;
            dbDoAn.TrangThai = educodeai_server.Models.TrangThaiDoAn.DangPhongVan;
            dbDoAn.NgayNop = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            phien.MaDoAn = dbDoAn.MaDoAn;

            // Lưu vào cache 2 tiếng
            _cache.Set($"phongvan_{sessionId}", phien, TimeSpan.FromHours(2));

            var cauHoi1 = await _SinhCauHoi(phien, 1);

            return new NopDoAnResponseDto
            {
                MaDoAn       = phien.MaDoAn,
                SessionId    = sessionId,         // ← key chính
                CauHoiDauTien = cauHoi1,
                Message      = $"Đồ án '{request.TenDoAn}' đã được nộp. Phiên phỏng vấn bắt đầu!"
            };
        }

        // ================================================================
        // MỚI: Trả lời câu phỏng vấn → AI chấm + sinh câu tiếp theo
        // ================================================================
        public async Task<TraLoiPhongVanResponseDto> TraLoiPhongVanAsync(int maNguoiDung, TraLoiPhongVanRequestDto request)
        {
            if (request.SoCauHienTai < 1 || request.SoCauHienTai > TONG_SO_CAU)
                throw new ArgumentException($"Số câu hỏi phải từ 1 đến {TONG_SO_CAU}.");

            if (string.IsNullOrWhiteSpace(request.CauTraLoi))
                throw new ArgumentException("Câu trả lời không được để trống.");

            var phien = _LayPhien(request.SessionId, maNguoiDung);
            if (phien.DaKetThuc)
                throw new InvalidOperationException("Phiên phỏng vấn đã kết thúc.");

            var (diem, nhanXet, cauHoiDaHoi) = await _ChamDiemCauTraLoi(phien, request.SoCauHienTai, request.CauTraLoi);

            phien.LichSu.Add(new PhongVanTurnDto
            {
                SoCau      = request.SoCauHienTai,
                CauHoi     = cauHoiDaHoi,
                CauTraLoi  = request.CauTraLoi,
                Diem       = diem,
                NhanXet    = nhanXet,
            });

            bool daKetThuc = request.SoCauHienTai >= TONG_SO_CAU;
            string? cauHoiTiep = null;

            if (!daKetThuc)
            {
                cauHoiTiep = await _SinhCauHoi(phien, request.SoCauHienTai + 1);
            }
            else
            {
                phien.TongDiem  = _QuyDoiDiem100(phien.LichSu.Sum(t => t.Diem));
                phien.DaKetThuc = true;
            }

            // Cập nhật cache
            _cache.Set($"phongvan_{phien.SessionId}", phien, TimeSpan.FromHours(2));

            return new TraLoiPhongVanResponseDto
            {
                SoCauHienTai   = request.SoCauHienTai,
                TongSoCau      = TONG_SO_CAU,
                DaKetThuc      = daKetThuc,
                DiemCauVua     = diem,
                NhanXet        = nhanXet,
                CauHoiTiepTheo = cauHoiTiep,
            };
        }

        // ================================================================
        // MỚI: Kết quả tổng kết + cấp mã chứng chỉ nếu đạt
        // ================================================================
        public async Task<KetQuaPhongVanDto> LayKetQuaPhongVanAsync(int maDoAn, int maNguoiDung, string? sessionId = null)
        {
            if (string.IsNullOrEmpty(sessionId))
                throw new Exception("Không tìm thấy phiên phỏng vấn.");

            var phien = _LayPhien(sessionId, maNguoiDung);
            int tongDiem = phien.TongDiem > 0 ? phien.TongDiem : _QuyDoiDiem100(phien.LichSu.Sum(t => t.Diem));
            bool daDat   = tongDiem >= NGUONG_DAT;

            // Cấp mã chứng chỉ nếu đạt và chưa có
            if (daDat && string.IsNullOrEmpty(phien.MaChungChi))
            {
                phien.MaChungChi = $"CC-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
                _cache.Set($"phongvan_{phien.SessionId}", phien, TimeSpan.FromHours(2));
            }

            // Lưu kết quả vào DB
            if (phien.MaDoAn > 0)
            {
                var dbDoAn = await _dbContext.DoAnThucChiens
                    .FirstOrDefaultAsync(x => x.MaDoAn == phien.MaDoAn && x.MaNguoiDung == maNguoiDung);
                if (dbDoAn != null)
                {
                    dbDoAn.DiemPhongVan = tongDiem;
                    dbDoAn.TrangThai = daDat ? educodeai_server.Models.TrangThaiDoAn.DatChungChi : educodeai_server.Models.TrangThaiDoAn.ChuaDat;
                    dbDoAn.LichSuPhongVanJSON = JsonSerializer.Serialize(phien.LichSu);
                    dbDoAn.NgayPhongVan = DateTime.UtcNow;

                    if (daDat && !string.IsNullOrEmpty(phien.MaChungChi))
                    {
                        var existsCert = _dbContext.ChungChiDoAns.Any(c => c.MaDoAn == phien.MaDoAn);
                        if (!existsCert)
                        {
                            _dbContext.ChungChiDoAns.Add(new educodeai_server.Models.ChungChiDoAnModel
                            {
                                MaNguoiDung = maNguoiDung,
                                MaDoAn = phien.MaDoAn,
                                MaChungChi = phien.MaChungChi,
                                DiemDat = tongDiem,
                                NgayCap = DateTime.UtcNow
                            });
                        }
                    }

                    await _dbContext.SaveChangesAsync();
                }
            }

            string nhanXetTong = await _SinhNhanXetTong(phien, tongDiem, daDat);

            return new KetQuaPhongVanDto
            {
                MaDoAn       = phien.MaDoAn,
                TongDiem     = tongDiem,
                DaDat        = daDat,
                NhanXetTong  = nhanXetTong,
                MaChungChi   = phien.MaChungChi,
                ChiTietCauHoi = phien.LichSu.Select(t => new ChiTietCauHoiDto
                {
                    SoCau      = t.SoCau,
                    CauHoi     = t.CauHoi,
                    CauTraLoi  = t.CauTraLoi,
                    Diem       = t.Diem,
                    NhanXet    = t.NhanXet,
                }).ToList()
            };
        }

        // ================================================================
        // MỚI: Chấm điểm từng tính năng
        // ================================================================
        public async Task<ChamDiemTinhNangResponseDto> ChamDiemTinhNangAsync(int maNguoiDung, ChamDiemTinhNangRequestDto request)
        {
            var prompt = $@"
Bạn là một Senior Code Reviewer.
Học viên đang làm đồ án: {request.TenDoAn}
Mô tả đồ án: {request.MoTa}

TÍNH NĂNG CẦN CHẤM: {request.TenTinhNang}
TÊN FILE: {request.TenFile}

KHÓ KHĂN HỌC VIÊN GẶP PHẢI: {request.KhoKhan}
SỬA ĐỔI SO VỚI YÊU CẦU: {request.SuaDoi}

MÃ NGUỒN CỦA HỌC VIÊN:
```
{request.NoiDungFile}
```

Nhiệm vụ của bạn là đánh giá mã nguồn xem học viên đã thực hiện tính năng '{request.TenTinhNang}' tốt đến đâu.
- Kiểm tra dấu hiệu copy code/cheat: Nếu code quá hoàn hảo, sử dụng các thư viện ngoài không cần thiết, hoặc có format/comment bất thường (như do AI sinh ra), hãy trừ điểm nặng.
- Chấm điểm (0-100). Đạt là >= 50.
- Trả về JSON: {{ ""Diem"": <điểm>, ""NhanXet"": ""<nhận xét>"" }}
- LƯU Ý: Nhận xét CỰC KỲ NGẮN GỌN (tối đa 2-3 câu), chỉ nêu đúng trọng tâm để tiết kiệm token. BẮT BUỘC VIẾT BẰNG TIẾNG VIỆT CÓ DẤU (ví dụ: 'Học viên đã triển khai tốt' chứ KHÔNG ĐƯỢC viết 'Hoc vien da trien khai tot'). Bắt buộc escape ký tự đặc biệt, không dùng Enter (xuống dòng), dùng nháy đơn thay nháy kép trong chuỗi.
";
            try
            {
                var raw = await _gemini.GenerateAsync(prompt, true);
                var json = ChuanHoaJsonTuAIHelper.ChuanHoa(raw);

                var parsed = JsonSerializer.Deserialize<JsonElement>(json);
                int diem = Math.Max(0, Math.Min(100, parsed.GetProperty("Diem").GetInt32()));
                string nx = parsed.GetProperty("NhanXet").GetString() ?? "";

                // Cập nhật Database nếu MaDoAn hợp lệ
                if (request.MaDoAn > 0)
                {
                    var doAn = await _dbContext.DoAnThucChiens.FindAsync(request.MaDoAn);
                    if (doAn != null && doAn.MaNguoiDung == maNguoiDung)
                    {
                        try
                        {
                            var lstYeuCau = JsonSerializer.Deserialize<List<YeuCauChucNangDto>>(doAn.YeuCauChucNangJSON, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<YeuCauChucNangDto>();
                            var currentFeature = lstYeuCau.FirstOrDefault(f => f.Ngay == request.Ngay);
                            if (currentFeature != null)
                            {
                                currentFeature.Diem = diem;
                                currentFeature.NhanXet = nx;
                                if (diem >= 50)
                                {
                                    currentFeature.NgayHoanThanh = DateTime.UtcNow;
                                    currentFeature.TrangThai = "Done";
                                }
                                doAn.YeuCauChucNangJSON = JsonSerializer.Serialize(lstYeuCau);
                                await _dbContext.SaveChangesAsync();
                            }
                        }
                        catch (JsonException)
                        {
                            // Dữ liệu cũ không đúng format, bỏ qua việc cập nhật DB
                        }
                    }
                }

                return new ChamDiemTinhNangResponseDto
                {
                    Diem = diem,
                    NhanXet = nx
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi AI chấm điểm: {ex.Message}");
            }
        }

        // ================================================================
        // MỚI: Lấy danh sách chứng chỉ đồ án thực chiến
        // ================================================================
        public async Task<List<ChungChiThucChienDto>> LayDanhSachChungChiAsync(int maNguoiDung)
        {
            return await _dbContext.ChungChiDoAns
                .Include(c => c.DoAn)
                .Where(c => c.MaNguoiDung == maNguoiDung)
                .OrderByDescending(c => c.NgayCap)
                .Select(c => new ChungChiThucChienDto
                {
                    MaChungChiDoAn = c.MaChungChiDoAn,
                    MaDoAn = c.MaDoAn,
                    TenDoAn = c.DoAn.TenDoAn,
                    MaChungChi = c.MaChungChi,
                    DiemDat = c.DiemDat,
                    NgayCap = c.NgayCap,
                    MucTieuNgheNghiep = c.DoAn.MucTieuNgheNghiep,
                    NgonNguCongNghe = c.DoAn.NgonNguCongNghe
                })
                .ToListAsync();
        }

        // ================================================================
        // PRIVATE helpers
        // ================================================================
        private PhienPhongVan _LayPhien(string sessionId, int maNguoiDung)
        {
            if (string.IsNullOrWhiteSpace(sessionId))
                throw new ArgumentException("SessionId không hợp lệ.");

            if (!_cache.TryGetValue($"phongvan_{sessionId}", out PhienPhongVan? phien) || phien == null)
                throw new Exception("Phiên phỏng vấn không tồn tại hoặc đã hết hạn (>2 tiếng).");

            if (phien.MaNguoiDung != maNguoiDung)
                throw new UnauthorizedAccessException("Phiên phỏng vấn không thuộc về tài khoản hiện tại.");

            return phien;
        }

        // Quy đổi tổng điểm thô (TONG_SO_CAU * DIEM_MOI_CAU) về thang 100 mà UI dùng.
        private static int _QuyDoiDiem100(int diemTho)
        {
            int diemToiDaTho = TONG_SO_CAU * DIEM_MOI_CAU;
            if (diemToiDaTho <= 0) return 0;
            return (int)Math.Round(diemTho * 100.0 / diemToiDaTho);
        }

        private async Task<string> _SinhCauHoi(PhienPhongVan phien, int soCau)
        {
            var sbLichSu = new StringBuilder();
            foreach (var t in phien.LichSu)
                sbLichSu.AppendLine($"Câu {t.SoCau}: {t.CauHoi}\nHọc viên: {t.CauTraLoi}\n");

            var prompt = $@"
Bạn là một Senior Tech Lead cởi mở, đang phỏng vấn học viên về đồ án thực tế của họ. 

=== THÔNG TIN ĐỒ ÁN (THIẾT KẾ BAN ĐẦU - A) ===
Tên: {phien.TenDoAn}
Mô tả: {phien.MoTa}
Mục tiêu: {phien.MucTieuNgheNghiep} | Công nghệ: {phien.NgonNguCongNghe}
Yêu cầu chức năng: {JsonSerializer.Serialize(phien.YeuCauChucNang)}
Cấu trúc Database: {phien.CauTrucDatabase}

=== THAY ĐỔI VÀ KHÓ KHĂN CỦA HỌC VIÊN (THỰC TẾ LÀM - B) ===
- Tiến độ hoàn thành: {(string.IsNullOrWhiteSpace(phien.TienDoHoanThanh) ? "Không rõ" : phien.TienDoHoanThanh)}
- Thay đổi kiến trúc/công nghệ: {(string.IsNullOrWhiteSpace(phien.GhiChuThayDoi) ? "Không có" : phien.GhiChuThayDoi)}
- Khó khăn gặp phải: {(string.IsNullOrWhiteSpace(phien.KhoKhan) ? "Không có" : phien.KhoKhan)}

=== CÁC CÂU ĐÃ HỎI ===
{(phien.LichSu.Count == 0 ? "(Chưa có)" : sbLichSu.ToString())}

=== NHIỆM VỤ CỦA BẠN ===
Đặt câu hỏi phỏng vấn số {soCau}/{TONG_SO_CAU}.
Lưu ý quan trọng: 
- NẾU PHÁT HIỆN DẤU HIỆU COPY CODE (thông qua code tính năng hoặc trả lời hời hợt): Hãy đặt một câu hỏi cực kỳ chi tiết về 1 dòng lệnh/thuật toán để ép học viên giải thích cặn kẽ bản chất, nhằm kiểm tra xem họ có thực sự tự làm không.
- Nếu thí sinh làm khác với thiết kế ban đầu (A) dựa trên phần thay đổi (B), hãy CHẤP NHẬN cách làm đó. Đừng coi đó là lỗi.
- Thay vào đó, hãy biến buổi phỏng vấn thành buổi ""Phản biện kiến trúc"" (Architectural Defense). Tập trung hỏi xoáy vào LÝ DO tại sao họ lại chọn hướng đi đó, ưu/nhược điểm so với đề xuất ban đầu, và yêu cầu họ bảo vệ quyết định của mình.
- Ví dụ: ""Anh thấy em đã thiết kế luồng API hơi khác so với ban đầu. Theo em, việc tách logic ra làm 2 API riêng biệt như em làm có ưu và nhược điểm gì về mặt hiệu năng?""
- Xưng ""anh"", gọi ""em"", giọng điệu chuyên nghiệp, cực kỳ nghiêm ngặt và nhạy bén để chống gian lận.
- KHÔNG hỏi lại câu cũ, KHÔNG hỏi chung chung. Đi sâu vào 1 chi tiết (schema, logic, security, perf...).

=== YÊU CẦU BẮT BUỘC (QUAN TRỌNG) ===
BẠN PHẢI TRẢ VỀ DUY NHẤT 1 OBJECT JSON, TUYỆT ĐỐI KHÔNG VIẾT SUY NGHĨ CỦA BẠN, KHÔNG DÙNG MARKDOWN, KHÔNG DÙNG TIẾNG ANH.
JSON CÓ ĐÚNG 1 TRƯỜNG, nội dung câu hỏi phải VIẾT BẰNG TIẾNG VIỆT, là 1 câu hỏi hoàn chỉnh:
{{
  ""CauHoi"": ""<nội dung câu hỏi phỏng vấn bằng tiếng Việt>""
}}

[VIẾT TRỰC TIẾP JSON CỦA BẠN DƯỚI ĐÂY]:
";
            try
            {
                var raw = await _gemini.GenerateAsync(prompt, true); // isJsonMode = true
                var json = ChuanHoaJsonTuAIHelper.ChuanHoa(raw);

                var parsed = JsonSerializer.Deserialize<JsonElement>(json);
                string cauHoi = parsed.TryGetProperty("CauHoi", out var ch)
                    ? (ch.GetString() ?? "").Trim()
                    : "";

                if (string.IsNullOrWhiteSpace(cauHoi))
                    cauHoi = $"Em hãy trình bày chi tiết cách em triển khai một chức năng cốt lõi trong đồ án \"{phien.TenDoAn}\" và giải thích lý do em chọn cách làm đó.";

                // Lưu lại câu hỏi vừa sinh để hàm chấm điểm dùng đúng câu hỏi thật học viên đã thấy
                phien.CauHoiHienTai = cauHoi;
                return cauHoi;
            }
            catch (Exception ex)
            {
                var loi = $"[Hệ thống AI đang gián đoạn hoặc hết Token, vui lòng thử lại sau] Chi tiết: {ex.Message}";
                phien.CauHoiHienTai = loi;
                return loi;
            }
        }

        private async Task<(int Diem, string NhanXet, string CauHoiDaHoi)> _ChamDiemCauTraLoi(
            PhienPhongVan phien, int soCau, string cauTraLoi)
        {
            // Câu hỏi thật sự vừa hỏi được lưu trong phiên (CauHoiHienTai).
            // Fallback về lịch sử rồi placeholder nếu vì lý do nào đó chưa có.
            string cauHoiDaHoi = !string.IsNullOrWhiteSpace(phien.CauHoiHienTai)
                ? phien.CauHoiHienTai
                : (phien.LichSu.Count >= soCau
                    ? phien.LichSu[soCau - 1].CauHoi
                    : $"Câu hỏi số {soCau} về đồ án {phien.TenDoAn}");

            var prompt = $@"
Bạn là một Senior Tech Lead đang chấm điểm câu trả lời phỏng vấn.

Đồ án: {phien.TenDoAn} | Công nghệ: {phien.NgonNguCongNghe}
Tiến độ hoàn thành: {(string.IsNullOrWhiteSpace(phien.TienDoHoanThanh) ? "Không rõ" : phien.TienDoHoanThanh)}
Ghi chú thay đổi (nếu có): {(string.IsNullOrWhiteSpace(phien.GhiChuThayDoi) ? "Không có" : phien.GhiChuThayDoi)}
Khó khăn gặp phải: {(string.IsNullOrWhiteSpace(phien.KhoKhan) ? "Không có" : phien.KhoKhan)}

CÂU HỎI (Phản biện kiến trúc / Kỹ thuật): {cauHoiDaHoi}
CÂU TRẢ LỜI CỦA HỌC VIÊN: {cauTraLoi}

Chấm điểm (tối đa 20/câu):
- Đừng trừ điểm nếu học viên làm khác đề bài gốc. Miễn là lập luận hợp lý, hiểu rõ công nghệ.
- 18-20: Chính xác, lập luận chặt chẽ, bảo vệ kiến trúc xuất sắc, thể hiện sự hiểu biết sâu sắc. Không có dấu hiệu sao chép.
- 13-17: Đúng hướng nhưng lập luận còn thiếu chi tiết hoặc chưa thấy rõ ưu nhược điểm.
- 8-12: Trả lời chung chung, thiếu chiều sâu thực tế, có thể hiểu loáng thoáng.
- 0-7: Sai kiến thức cơ bản, lạc đề. NẾU phát hiện học viên copy code / học vẹt mà không hiểu bản chất: Cho thẳng điểm 0-2 và đưa ra nhận xét cảnh cáo (ví dụ: 'Anh nhận thấy câu trả lời của em giống văn bản mẫu/AI sinh ra và em không hiểu rõ cốt lõi').

=== YÊU CẦU BẮT BUỘC ===
BẠN PHẢI TRẢ VỀ DUY NHẤT 1 OBJECT JSON, TUYỆT ĐỐI KHÔNG VIẾT SUY NGHĨ CỦA BẠN, KHÔNG DÙNG MARKDOWN.
JSON CÓ ĐÚNG 2 TRƯỜNG:
{{
  ""Diem"": <số từ 0 đến 20>,
  ""NhanXet"": ""<nhận xét của bạn>""
}}

[VIẾT TRỰC TIẾP JSON CỦA BẠN DƯỚI ĐÂY]:
";

            try
            {
                var raw = await _gemini.GenerateAsync(prompt, true);
                var json = ChuanHoaJsonTuAIHelper.ChuanHoa(raw);

                var parsed = JsonSerializer.Deserialize<JsonElement>(json);
                int diem   = Math.Max(0, Math.Min(20, parsed.GetProperty("Diem").GetInt32()));
                string nx  = parsed.GetProperty("NhanXet").GetString() ?? "";
                return (diem, nx, cauHoiDaHoi);
            }
            catch (Exception ex)
            {
                return (5, $"AI gặp khó khăn khi đánh giá (Có thể do hết Token). Lỗi: {ex.Message}", cauHoiDaHoi);
            }
        }

        private async Task<string> _SinhNhanXetTong(PhienPhongVan phien, int tongDiem, bool daDat)
        {
            var sb = new StringBuilder();
            foreach (var t in phien.LichSu)
                sb.AppendLine($"Câu {t.SoCau} ({t.Diem}/20): {t.NhanXet}");

            var prompt = $@"
BẠN LÀ MỘT GIÁM KHẢO NGƯỜI VIỆT NAM.
Vừa kết thúc phỏng vấn đồ án '{phien.TenDoAn}'. 
Tổng điểm: {tongDiem}/100. Kết quả: {(daDat ? "ĐẠT" : "CHƯA ĐẠT")}.
Chi tiết: {sb}

Nhiệm vụ: Viết nhận xét tổng (3-4 câu) bằng TIẾNG VIỆT về: điểm mạnh, điểm cần cải thiện, lời khuyên.
Xưng ""anh"", gọi ""em"".

BẮT BUỘC TRẢ VỀ JSON DUY NHẤT NHƯ SAU (KHÔNG DÙNG MARKDOWN KHÁC, KHÔNG GIẢI THÍCH):
{{
  ""nhanXet"": ""<nội dung nhận xét bằng tiếng Việt>""
}}
";
            try
            {
                try
                {
                    var raw = await _gemini.GenerateAsync(prompt);
                    var json = ChuanHoaJsonTuAIHelper.ChuanHoa(raw);
                    var parsed = JsonSerializer.Deserialize<JsonElement>(json);
                    return parsed.GetProperty("nhanXet").GetString() ?? (daDat ? "Chúc mừng em đã vượt qua!" : "Em cần ôn tập thêm và thử lại.");
                }
                catch (Exception ex)
                {
                    return $"Hệ thống không thể tổng kết kết quả do lỗi kết nối AI: {ex.Message}";
                }
            }
            catch
            {
                return daDat ? "Chúc mừng em đã vượt qua!" : "Em cần ôn tập thêm và thử lại.";
            }
        }
    }
}

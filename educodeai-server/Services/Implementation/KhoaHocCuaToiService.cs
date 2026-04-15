using educodeai_server.DTOs;
using educodeai_server.Helpers;
using educodeai_server.Models;
using educodeai_server.Repository.Interface;
using educodeai_server.Services.Interface;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace educodeai_server.Services.Implement
{
    public class KhoaHocCuaToiService : IKhoaHocCuaToiService
    {
        private readonly IKhoaHocCuaToiRepository _repository;
        private readonly IGeminiAIService _gemini;

        public KhoaHocCuaToiService(IKhoaHocCuaToiRepository repository, IGeminiAIService gemini)
        {
            _repository = repository;
            _gemini = gemini;
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
                CoChungChi = k.CoChungChi,
                DaCoDeThiChungChi = !string.IsNullOrWhiteSpace(k.DuLieuDeChungChiJSON),
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
                CoChungChi = k.CoChungChi,
                TenChungChi = k.TenChungChi,
                DiemDatChungChi = k.DiemDatChungChi,
                SoCauHoiChungChi = k.SoCauHoiChungChi,
                ThoiGianLamBaiChungChi = k.ThoiGianLamBaiChungChi,
                DaCoDeThiChungChi = !string.IsNullOrWhiteSpace(k.DuLieuDeChungChiJSON),
                NguonDeChungChi = k.NguonDeChungChi,
                NgayTaoDeChungChi = k.NgayTaoDeChungChi,
                SoHocVien = k.DangKyKhoaHocs?.Count ?? 0,
                DiemDanhGiaTB = k.DiemDanhGiaTB,
                KyNangChinh = k.KyNangChinh,

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

        // ===== TẠO KHOÁ HỌC =====
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
                KyNangChinh = dto.KyNangChinh ?? string.Empty,
                CoChungChi = dto.CoChungChi,
                TenChungChi = dto.CoChungChi
                    ? (string.IsNullOrWhiteSpace(dto.TenChungChi) ? "Chứng nhận hoàn thành" : dto.TenChungChi.Trim())
                    : null,
                DiemDatChungChi = dto.CoChungChi ? dto.DiemDatChungChi : 80,
                SoCauHoiChungChi = dto.CoChungChi ? dto.SoCauHoiChungChi : 20,
                ThoiGianLamBaiChungChi = dto.CoChungChi ? dto.ThoiGianLamBaiChungChi : 30
            };

            await _repository.AddKhoaHocAsync(khoaHoc);
            await _repository.SaveChangesAsync();
            return true;
        }

        // ===== CẬP NHÂT KHOÁ HỌC =====
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
            khoaHoc.KyNangChinh = dto.KyNangChinh ?? string.Empty;
            khoaHoc.CoChungChi = dto.CoChungChi;
            khoaHoc.TenChungChi = dto.CoChungChi
                ? (string.IsNullOrWhiteSpace(dto.TenChungChi) ? "Chứng nhận hoàn thành" : dto.TenChungChi.Trim())
                : null;
            khoaHoc.DiemDatChungChi = dto.CoChungChi ? dto.DiemDatChungChi : 80;
            khoaHoc.SoCauHoiChungChi = dto.CoChungChi ? dto.SoCauHoiChungChi : 20;
            khoaHoc.ThoiGianLamBaiChungChi = dto.CoChungChi ? dto.ThoiGianLamBaiChungChi : 30;

            if (!dto.CoChungChi)
            {
                khoaHoc.DuLieuDeChungChiJSON = null;
                khoaHoc.NguonDeChungChi = null;
                khoaHoc.NgayTaoDeChungChi = null;
            }

            await _repository.UpdateKhoaHocAsync(khoaHoc);
            await _repository.SaveChangesAsync();
            return true;
        }

        // ===== XOÁ KHOÁ HỌC =====
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

        // ===== XOÁ CHƯƠNG =====
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
                throw new UnauthorizedAccessException("KhÃ´ng cÃ³ quyá»n thÃªm video vÃ o chÆ°Æ¡ng nÃ y.");

            var baiHoc = new BaiHocModel
            {
                MaChuong = maChuong,
                TieuDe = dto.TieuDe,
                LinkVideo = ExtractEmbedUrl(dto.LinkVideo),
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
                LinkVideo = dto.LinkVideo,
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
            baiHoc.LinkVideo = ExtractEmbedUrl(dto.LinkVideo);
            baiHoc.ThoiLuong = dto.ThoiLuong;
            baiHoc.ThuTu = dto.ThuTu;

            await _repository.UpdateBaiHocAsync(baiHoc);
            await _repository.SaveChangesAsync();
            return true;
        }

        // ===== XOÁ VIDEO =====
        public async Task<bool> XoaVideoAsync(int maBaiHoc, int maGiangVien)
        {
            var baiHoc = await _repository.GetBaiHocWithChuongAsync(maBaiHoc);
            if (baiHoc == null) return false;

            if (baiHoc.ChuongHoc.KhoaHoc.MaGiangVien != maGiangVien) return false;

            await _repository.DeleteBaiHocAsync(baiHoc);
            await _repository.SaveChangesAsync();
            return true;
        }

        public async Task<KetQuaTaoDeChungChiAIDTO> TaoDeChungChiBangAIAsync(int maKhoaHoc, int maGiangVien)
        {
            var khoaHoc = await _repository.GetKhoaHocForCertificateAsync(maKhoaHoc, maGiangVien);
            if (khoaHoc == null)
            {
                return new KetQuaTaoDeChungChiAIDTO
                {
                    ThanhCong = false,
                    ThongBao = "Không tìm thấy khóa học."
                };
            }

            if (!khoaHoc.CoChungChi)
            {
                return new KetQuaTaoDeChungChiAIDTO
                {
                    ThanhCong = false,
                    ThongBao = "Khóa học này chưa bật chế độ chứng chỉ."
                };
            }

            var noiDungKhoaHoc = TaoNoiDungTongHopChoAI(khoaHoc);
            if (string.IsNullOrWhiteSpace(noiDungKhoaHoc))
            {
                return new KetQuaTaoDeChungChiAIDTO
                {
                    ThanhCong = false,
                    ThongBao = "Khóa học chưa có đủ nội dung để AI tạo đề chứng chỉ."
                };
            }

            var soCauHoi = khoaHoc.SoCauHoiChungChi > 0 ? khoaHoc.SoCauHoiChungChi : 20;
            var prompt = TaoPromptDeThiChungChi(khoaHoc, noiDungKhoaHoc, soCauHoi);
            var aiResult = await _gemini.GenerateAsync(prompt);
            var jsonChuanHoa = ChuanHoaJsonTuAIHelper.ChuanHoa(aiResult);

            var danhSachCauHoi = JsonSerializer.Deserialize<List<CauHoiChungChiAIItem>>(jsonChuanHoa) ?? new List<CauHoiChungChiAIItem>();
            if (danhSachCauHoi.Count == 0)
            {
                return new KetQuaTaoDeChungChiAIDTO
                {
                    ThanhCong = false,
                    ThongBao = "AI chưa trả về bộ đề hợp lệ. Vui lòng thử lại."
                };
            }

            khoaHoc.DuLieuDeChungChiJSON = JsonSerializer.Serialize(danhSachCauHoi.Select((cauHoi, index) => new
            {
                id = index + 1,
                cauHoi = cauHoi.CauHoi,
                dapAnA = cauHoi.DapAnA,
                dapAnB = cauHoi.DapAnB,
                dapAnC = cauHoi.DapAnC,
                dapAnD = cauHoi.DapAnD,
                dapAnDung = cauHoi.DapAnDung,
                giaiThich = cauHoi.GiaiThich
            }));
            khoaHoc.NguonDeChungChi = "AI";
            khoaHoc.NgayTaoDeChungChi = DateTime.UtcNow;

            await _repository.UpdateKhoaHocAsync(khoaHoc);
            await _repository.SaveChangesAsync();

            return new KetQuaTaoDeChungChiAIDTO
            {
                ThanhCong = true,
                ThongBao = "Đã tạo đề chứng chỉ bằng AI thành công.",
                SoCauHoi = danhSachCauHoi.Count,
                NguonDeChungChi = khoaHoc.NguonDeChungChi,
                NgayTaoDeChungChi = khoaHoc.NgayTaoDeChungChi
            };
        }

        private static string? ExtractEmbedUrl(string? url)
        {
            if (string.IsNullOrWhiteSpace(url)) return null;

            var patterns = new[]
            {
                @"[?&]v=([^&]+)",
                @"youtu\.be/([^?&]+)",
                @"embed/([^?&/]+)",
                @"shorts/([^?&]+)",
    };

            foreach (var pattern in patterns)
            {
                var match = System.Text.RegularExpressions.Regex.Match(url, pattern);
                if (match.Success)
                    return $"https://www.youtube.com/embed/{match.Groups[1].Value}";
            }

            return url;
        }

        private static string TaoNoiDungTongHopChoAI(KhoaHocModel khoaHoc)
        {
            var phanNoiDung = khoaHoc.ChuongHocs?
                .OrderBy(chuong => chuong.ThuTu)
                .SelectMany(chuong => chuong.BaiHocs.OrderBy(baiHoc => baiHoc.ThuTu))
                .Select((baiHoc, index) =>
                {
                    var noiDung = string.IsNullOrWhiteSpace(baiHoc.NoiDung)
                        ? "Không có mô tả chi tiết."
                        : baiHoc.NoiDung;
                    return $"Bài {index + 1}: {baiHoc.TieuDe}\n{noiDung}";
                })
                .ToList() ?? new List<string>();

            return string.Join("\n\n", phanNoiDung);
        }

        private static string TaoPromptDeThiChungChi(KhoaHocModel khoaHoc, string noiDungKhoaHoc, int soCauHoi)
        {
            var tenChungChi = khoaHoc.TenChungChi ?? "Chứng nhận hoàn thành";
            return $@"
Bạn là chuyên gia giáo dục của hệ thống EduCodeAI.
Hãy tạo đúng {soCauHoi} câu hỏi trắc nghiệm cho bài kiểm tra nhận chứng chỉ của khóa học.

THÔNG TIN KHÓA HỌC
- Tên khóa học: {khoaHoc.TenKhoaHoc}
- Tên chứng chỉ: {tenChungChi}
- Lĩnh vực: {khoaHoc.LinhVuc}
- Trình độ: {khoaHoc.TrinhDo}
- Mô tả: {khoaHoc.MoTa}

NỘI DUNG KHÓA HỌC
{noiDungKhoaHoc}

YÊU CẦU
1. Câu hỏi phải bám sát nội dung khóa học.
2. Mỗi câu có 4 đáp án A, B, C, D và chỉ có 1 đáp án đúng.
3. Trường dapAnDung chỉ nhận A, B, C hoặc D.
4. Mỗi câu cần có giải thích ngắn gọn.
5. Không dùng markdown, không giải thích thêm ngoài JSON.

OUTPUT JSON THUẦN
[
  {{
    ""cauHoi"": """",
    ""dapAnA"": """",
    ""dapAnB"": """",
    ""dapAnC"": """",
    ""dapAnD"": """",
    ""dapAnDung"": ""A"",
    ""giaiThich"": """"
  }}
]";
        }

        private sealed class CauHoiChungChiAIItem
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
            public string DapAnDung { get; set; } = "A";
            [JsonPropertyName("giaiThich")]
            public string GiaiThich { get; set; } = string.Empty;
        }
    }
}

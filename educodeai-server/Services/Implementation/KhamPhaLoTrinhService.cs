using educodeai_server.Data;
using educodeai_server.DTOs.HocVien;
using educodeai_server.Models;
using educodeai_server.Services.Interface;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace educodeai_server.Services.Implementation
{
    public class KhamPhaLoTrinhService : IKhamPhaLoTrinhService
    {
        private readonly EduCodeAIDbContext _context;

        public KhamPhaLoTrinhService(EduCodeAIDbContext context)
        {
            _context = context;
        }

        // 1. Hàm lấy danh sách + Tìm kiếm (Tên phải là LayDanhSachAsync mới khớp Interface)
        public async Task<PagedResultDto<LoTrinhKhamPhaDto>> LayDanhSachAsync(string tuKhoa, int pageIndex, int pageSize)
        {
            var query = _context.LoTrinhAIs.Where(x => x.TrangThai == "Hoạt động");

            if (!string.IsNullOrWhiteSpace(tuKhoa))
            {
                query = query.Where(x => x.YeuCau != null && x.YeuCau.Contains(tuKhoa));
            }

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(x => x.NgayTao)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new LoTrinhKhamPhaDto
                {
                    MaLoTrinh = x.MaLoTrinh,
                    TieuDe = x.YeuCau,
                    NgayTao = x.NgayTao,
                    MaGiangVien = x.MaNguoiDung,
                    NoiDungJSON = x.NoiDungJSON ?? "[]"
                }).ToListAsync();

            return new PagedResultDto<LoTrinhKhamPhaDto>
            {
                Items = items,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };
        }

        // 2. Hàm lấy chi tiết để hiện Modal
        public async Task<LoTrinhChiTietDto?> LayChiTietLoTrinhAsync(int maLoTrinh)
        {
            var item = await _context.LoTrinhAIs
                .Include(x => x.NguoiDung)
                .FirstOrDefaultAsync(x => x.MaLoTrinh == maLoTrinh && x.TrangThai == "Hoạt động");

            if (item == null) return null;

            var danhSachChang = new List<ChangHocDto>();
            try
            {
                if (!string.IsNullOrEmpty(item.NoiDungJSON))
                    danhSachChang = JsonConvert.DeserializeObject<List<ChangHocDto>>(item.NoiDungJSON) ?? new List<ChangHocDto>();
            }
            catch { /* Parse lỗi thì thôi, trả list rỗng */ }

            return new LoTrinhChiTietDto
            {
                MaLoTrinh = item.MaLoTrinh,
                TieuDe = item.YeuCau,
                TenGiangVien = item.NguoiDung?.HoTen ?? "Hệ thống AI",
                NgayTao = item.NgayTao,
                CacChangHoc = danhSachChang
            };
        }

        // 3. Hàm lưu lộ trình
        public async Task<bool> LuuLoTrinhVaoTaiKhoanAsync(int maLoTrinhGoc, int maHocVien)
        {
            var loTrinhGoc = await _context.LoTrinhAIs.FirstOrDefaultAsync(x => x.MaLoTrinh == maLoTrinhGoc);
            if (loTrinhGoc == null) return false;

            string finalJson = loTrinhGoc.NoiDungJSON ?? "{}";

            // Chuyển đổi format JSON Khám Phá -> format NoiDungLoTrinhDTO chuẩn để trang ChiTietLoTrinh đọc được
            try
            {
                var extractedSteps = new List<JObject>();
                string title = loTrinhGoc.YeuCau ?? "Lộ trình AI đã lưu";

                try
                {
                    var token = JToken.Parse(finalJson);
                    if (token is JArray arr)
                    {
                        extractedSteps = arr.Select(x => (JObject)x).ToList();
                    }
                    else if (token is JObject obj)
                    {
                        if (obj["tieuDe"] != null) title = obj["tieuDe"].ToString();
                        else if (obj["tenLoTrinh"] != null) title = obj["tenLoTrinh"].ToString();

                        if (obj["loTrinh"] is JArray arr1) extractedSteps = arr1.Select(x => (JObject)x).ToList();
                        else if (obj["cacChangHoc"] is JArray arr2) extractedSteps = arr2.Select(x => (JObject)x).ToList();
                        else if (obj["steps"] is JArray arr3) extractedSteps = arr3.Select(x => (JObject)x).ToList();
                        else if (obj["khoaHocSuDung"] is JArray arr4) extractedSteps = arr4.Select(x => (JObject)x).ToList();
                    }
                }
                catch { }

                if (extractedSteps.Count > 0)
                {
                    var dtoObj = new
                    {
                        tenLoTrinh = title,
                        moTaChung = "Lộ trình lưu từ trang Khám phá của cộng đồng",
                        tongThoiGianTuan = extractedSteps.Count,
                        loTrinh = new List<object>()
                    };

                    int gdIndex = 1;
                    foreach (var step in extractedSteps)
                    {
                        int maKh = 0;
                        string ten = "Khóa học";
                        string ghiChu = "Bắt buộc";

                        if (step["khoaHocSuDung"] is JArray khArr && khArr.Count > 0)
                        {
                            var kh = khArr[0];
                            if (kh["maKhoaHoc"] != null) int.TryParse(kh["maKhoaHoc"].ToString(), out maKh);
                            if (kh["tenKhoaHoc"] != null) ten = kh["tenKhoaHoc"].ToString();
                            else if (kh["ten"] != null) ten = kh["ten"].ToString();
                            if (kh["ghiChu"] != null) ghiChu = kh["ghiChu"].ToString();
                        }
                        else
                        {
                            if (step["maKhoaHoc"] != null) int.TryParse(step["maKhoaHoc"].ToString(), out maKh);
                            if (step["tenKhoaHoc"] != null) ten = step["tenKhoaHoc"].ToString();
                            else if (step["ten"] != null) ten = step["ten"].ToString();

                            if (step["trangThai"] != null) ghiChu = step["trangThai"].ToString();
                            else if (step["loai"] != null) ghiChu = step["loai"].ToString();
                            else if (step["ghiChu"] != null) ghiChu = step["ghiChu"].ToString();
                        }

                        dtoObj.loTrinh.Add(new
                        {
                            GiaiDoan = gdIndex++,
                            mucTieu = ten,
                            khoaHocSuDung = new List<object> {
                                new {
                                    maKhoaHoc = maKh,
                                    TuTuan = 1,
                                    DenTuan = 1,
                                    tenKhoaHoc = ten,
                                    noiDungChinh = ghiChu,
                                    ghiChu = ghiChu
                                }
                            }
                        });
                    }

                    finalJson = JsonConvert.SerializeObject(dtoObj);
                }
            }
            catch { }

            var entity = new LoTrinhAIModel
            {
                MaNguoiDung = maHocVien,
                YeuCau = loTrinhGoc.YeuCau,
                NoiDungJSON = finalJson,
                TrangThai = "Đã lưu",
                NgayTao = DateTime.Now
            };

            _context.LoTrinhAIs.Add(entity);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
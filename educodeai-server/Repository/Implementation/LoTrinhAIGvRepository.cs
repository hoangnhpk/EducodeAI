using educodeai_server.Data;
using educodeai_server.DTOs.AI;
using educodeai_server.Models;
using educodeai_server.Repository.Interface;

namespace educodeai_server.Repository.Implementation
{
    public class LoTrinhAIGvRepository : ILoTrinhAIGvRepository
    {
        private readonly EduCodeAIDbContext _context;

        public LoTrinhAIGvRepository(EduCodeAIDbContext context)
        {
            _context = context;
        }

        public async Task LuuLichSuAIAsync(LoTrinhAIModel model)
        {
            await _context.LoTrinhAIs.AddAsync(model);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> LuuKhoaHocChinhThucAsync(AIGeneratedKhoaHocDTO data, int maGiangVien)
        {
            // Bắt đầu Transaction
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Tạo Khóa Học
                var khoaHoc = new KhoaHocModel
                {
                    MaGiangVien = maGiangVien,
                    TenKhoaHoc = data.TenKhoaHoc,
                    MoTa = data.MoTa,
                    LinhVuc = data.LinhVuc,
                    TrinhDo = data.TrinhDo,
                    KyNangChinh = data.KyNangChinh,
                    ThoiLuongGio = data.ThoiLuongGio,
                    TrangThai = "Bản nháp",
                    NgayTao = DateTime.Now
                };

                await _context.KhoaHocs.AddAsync(khoaHoc);
                await _context.SaveChangesAsync(); // Lưu để EF Core sinh ra MaKhoaHoc

                // 2. Tạo các Chương Học
                foreach (var chuongDto in data.ChuongHocs)
                {
                    var chuong = new ChuongHocModel
                    {
                        MaKhoaHoc = khoaHoc.MaKhoaHoc,
                        TenChuong = chuongDto.TenChuong,
                        ThuTu = chuongDto.ThuTu
                    };

                    await _context.ChuongHocs.AddAsync(chuong);
                    await _context.SaveChangesAsync(); // Lưu để EF Core sinh ra MaChuong

                    // 3. Tạo các Bài Học trong chương đó
                    foreach (var baiDto in chuongDto.BaiHocs)
                    {
                        var baiHoc = new BaiHocModel
                        {
                            MaChuong = chuong.MaChuong,
                            TieuDe = baiDto.TieuDe,
                            LoaiBaiHoc = baiDto.LoaiBaiHoc,
                            ThuTu = baiDto.ThuTu
                        };
                        await _context.BaiHocs.AddAsync(baiHoc);
                    }
                    await _context.SaveChangesAsync(); // Lưu hàng loạt bài học của 1 chương
                }

                // Nếu tất cả đều thành công, chốt Transaction
                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                // Có lỗi xảy ra -> Xóa sạch các thao tác vừa làm trong transaction
                await transaction.RollbackAsync();
                Console.WriteLine($"[LoTrinhAIGvRepository] Lỗi lưu khóa học: {ex.Message}");
                return false;
            }
        }
    }
}
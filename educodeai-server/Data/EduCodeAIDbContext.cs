using educodeai_server.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace educodeai_server.Data
{
    public class EduCodeAIDbContext : DbContext
    {
        public EduCodeAIDbContext(DbContextOptions<EduCodeAIDbContext> options) : base(options)
        {
        }

        // 16 bảng dữ liệu
        public DbSet<NguoiDungModel> NguoiDungs { get; set; }
        public DbSet<NgonNguLapTrinhModel> NgonNguLapTrinhs { get; set; }
        public DbSet<KhoaHocModel> KhoaHocs { get; set; }
        public DbSet<ChuongHocModel> ChuongHocs { get; set; }
        public DbSet<BaiHocModel> BaiHocs { get; set; }
        public DbSet<DangKyKhoaHocModel> DangKyKhoaHocs { get; set; }
        public DbSet<TienDoBaiHocModel> TienDoBaiHocs { get; set; }
        public DbSet<DanhGiaModel> DanhGias { get; set; }
        public DbSet<BinhLuanModel> BinhLuans { get; set; }
        public DbSet<BaiTapModel> BaiTaps { get; set; }
        public DbSet<BaiTap_NgonNguModel> BaiTap_NgonNgus { get; set; }
        public DbSet<BoThuNghiemModel> BoThuNghiems { get; set; }
        public DbSet<BaiNopModel> BaiNops { get; set; }
        public DbSet<LoTrinhAIModel> LoTrinhAIs { get; set; }
        public DbSet<CuocHoiThoaiAIModel> CuocHoiThoaiAIs { get; set; }
        public DbSet<TinNhanAIModel> TinNhanAIs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. Cấu hình các ràng buộc Duy nhất (Unique)
            modelBuilder.Entity<NguoiDungModel>().HasIndex(u => u.TaiKhoan).IsUnique();
            modelBuilder.Entity<NguoiDungModel>().HasIndex(u => u.Email).IsUnique();
            modelBuilder.Entity<TienDoBaiHocModel>().HasIndex(t => new { t.MaNguoiDung, t.MaBaiHoc }).IsUnique();
            modelBuilder.Entity<BaiTap_NgonNguModel>().HasIndex(b => new { b.MaBaiTap, b.MaNgonNgu }).IsUnique();
            modelBuilder.Entity<DanhGiaModel>().HasIndex(d => new { d.MaNguoiDung, d.MaKhoaHoc }).IsUnique();

            // 2. GIẢI PHÁP TRIỆT ĐỂ CHO LỖI 1785 (Multiple Cascade Paths)
            // Thay vì sửa từng bảng, ta quét toàn bộ quan hệ trong Database
            // Nếu bất kỳ quan hệ nào có Cascade Delete, ta chuyển hết về NoAction
            foreach (var relationship in modelBuilder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
            {
                relationship.DeleteBehavior = DeleteBehavior.NoAction;
            }

            // 3. Xử lý riêng cho trường hợp Self-Join (Bình luận cha-con) 
            // Vòng lặp trên đã xử lý luôn phần này về NoAction cho bạn rồi.
        }
    }
}

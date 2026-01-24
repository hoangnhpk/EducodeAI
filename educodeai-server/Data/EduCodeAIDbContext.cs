using educodeai_server.Data.DuLieuMau;
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

            // ====== INDEXES ======
            modelBuilder.Entity<NguoiDungModel>().HasIndex(u => u.TaiKhoan).IsUnique();
            modelBuilder.Entity<NguoiDungModel>().HasIndex(u => u.Email).IsUnique();
            modelBuilder.Entity<TienDoBaiHocModel>().HasIndex(t => new { t.MaNguoiDung, t.MaBaiHoc }).IsUnique();
            modelBuilder.Entity<BaiTap_NgonNguModel>().HasIndex(b => new { b.MaBaiTap, b.MaNgonNgu }).IsUnique();
            modelBuilder.Entity<DanhGiaModel>().HasIndex(d => new { d.MaNguoiDung, d.MaKhoaHoc }).IsUnique();

            // ====== RELATIONSHIPS CONFIGURATION ======
            
            // NguoiDungModel relationships
            modelBuilder.Entity<NguoiDungModel>()
                .HasMany(n => n.KhoaHocs)
                .WithOne(k => k.GiangVien)
                .HasForeignKey(k => k.MaGiangVien)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<NguoiDungModel>()
                .HasMany(n => n.DangKyKhoaHocs)
                .WithOne(d => d.NguoiDung)
                .HasForeignKey(d => d.MaNguoiDung)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<NguoiDungModel>()
                .HasMany(n => n.TienDoBaiHocs)
                .WithOne(t => t.NguoiDung)
                .HasForeignKey(t => t.MaNguoiDung)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<NguoiDungModel>()
                .HasMany(n => n.DanhGias)
                .WithOne(d => d.NguoiDung)
                .HasForeignKey(d => d.MaNguoiDung)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<NguoiDungModel>()
                .HasMany(n => n.BinhLuans)
                .WithOne(b => b.NguoiDung)
                .HasForeignKey(b => b.MaNguoiDung)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<NguoiDungModel>()
                .HasMany(n => n.GhiChuBaiHocs)
                .WithOne(g => g.NguoiDung)
                .HasForeignKey(g => g.MaNguoiDung)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<NguoiDungModel>()
                .HasMany(n => n.BaiNops)
                .WithOne(b => b.NguoiDung)
                .HasForeignKey(b => b.MaNguoiDung)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<NguoiDungModel>()
                .HasMany(n => n.LoTrinhAIs)
                .WithOne(l => l.NguoiDung)
                .HasForeignKey(l => l.MaNguoiDung)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<NguoiDungModel>()
                .HasMany(n => n.CuocHoiThoaiAIs)
                .WithOne(c => c.NguoiDung)
                .HasForeignKey(c => c.MaNguoiDung)
                .OnDelete(DeleteBehavior.NoAction);

            // KhoaHocModel relationships
            modelBuilder.Entity<KhoaHocModel>()
                .HasMany(k => k.ChuongHocs)
                .WithOne(c => c.KhoaHoc)
                .HasForeignKey(c => c.MaKhoaHoc)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<KhoaHocModel>()
                .HasMany(k => k.DangKyKhoaHocs)
                .WithOne(d => d.KhoaHoc)
                .HasForeignKey(d => d.MaKhoaHoc)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<KhoaHocModel>()
                .HasMany(k => k.DanhGias)
                .WithOne(d => d.KhoaHoc)
                .HasForeignKey(d => d.MaKhoaHoc)
                .OnDelete(DeleteBehavior.NoAction);

            // ChuongHocModel relationships
            modelBuilder.Entity<ChuongHocModel>()
                .HasMany(c => c.BaiHocs)
                .WithOne(b => b.ChuongHoc)
                .HasForeignKey(b => b.MaChuong)
                .OnDelete(DeleteBehavior.NoAction);

            // BaiHocModel relationships
            modelBuilder.Entity<BaiHocModel>()
                .HasMany(b => b.BaiTaps)
                .WithOne(bt => bt.BaiHoc)
                .HasForeignKey(bt => bt.MaBaiHoc)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<BaiHocModel>()
                .HasMany(b => b.TienDoBaiHocs)
                .WithOne(t => t.BaiHoc)
                .HasForeignKey(t => t.MaBaiHoc)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<BaiHocModel>()
                .HasMany(b => b.BinhLuans)
                .WithOne(bl => bl.BaiHoc)
                .HasForeignKey(bl => bl.MaBaiHoc)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<BaiHocModel>()
                .HasMany(b => b.GhiChuBaiHocs)
                .WithOne(g => g.BaiHoc)
                .HasForeignKey(g => g.MaBaiHoc)
                .OnDelete(DeleteBehavior.NoAction);

            // BaiTapModel relationships
            modelBuilder.Entity<BaiTapModel>()
                .HasMany(bt => bt.BaiTap_NgonNgus)
                .WithOne(btn => btn.BaiTap)
                .HasForeignKey(btn => btn.MaBaiTap)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<BaiTapModel>()
                .HasMany(bt => bt.BaiNops)
                .WithOne(bn => bn.BaiTap)
                .HasForeignKey(bn => bn.MaBaiTap)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<BaiTapModel>()
                .HasMany(bt => bt.BoThuNghiems)
                .WithOne(bth => bth.BaiTap)
                .HasForeignKey(bth => bth.MaBaiTap)
                .OnDelete(DeleteBehavior.NoAction);

            // NgonNguLapTrinhModel relationships
            modelBuilder.Entity<NgonNguLapTrinhModel>()
                .HasMany(n => n.BaiTap_NgonNgus)
                .WithOne(btn => btn.NgonNgu)
                .HasForeignKey(btn => btn.MaNgonNgu)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<NgonNguLapTrinhModel>()
                .HasMany(n => n.BaiNops)
                .WithOne(bn => bn.NgonNgu)
                .HasForeignKey(bn => bn.MaNgonNgu)
                .OnDelete(DeleteBehavior.NoAction);

            // BinhLuanModel self-referencing relationship
            modelBuilder.Entity<BinhLuanModel>()
                .HasOne(b => b.BinhLuanCha)
                .WithMany(b => b.BinhLuans)
                .HasForeignKey(b => b.MaBinhLuanCha)
                .OnDelete(DeleteBehavior.NoAction);

            // CuocHoiThoaiAIModel relationships
            modelBuilder.Entity<CuocHoiThoaiAIModel>()
                .HasMany(c => c.TinNhanAIs)
                .WithOne(t => t.CuocHoiThoaiAI)
                .HasForeignKey(t => t.MaHoiThoai)
                .OnDelete(DeleteBehavior.NoAction);

            // ====== SEED DATA ======
            KhoaHocDuLieu.SeedKhoaHoc(modelBuilder);
            ChuongHocDuLieu.SeedChuongHoc(modelBuilder);
            BaiHocDuLieu.SeedBaiHoc(modelBuilder);
            NguoiDungDuLieu.SeedNguoiDung(modelBuilder);
        }
    }
}

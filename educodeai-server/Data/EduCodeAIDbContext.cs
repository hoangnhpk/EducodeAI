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
        public DbSet<PhienDangNhapModel> PhienDangNhaps { get; set; }
        public DbSet<NgonNguLapTrinhModel> NgonNguLapTrinhs { get; set; }
        public DbSet<KhoaHocModel> KhoaHocs { get; set; }
        public DbSet<ChuongHocModel> ChuongHocs { get; set; }
        public DbSet<BaiHocModel> BaiHocs { get; set; }
        public DbSet<DangKyKhoaHocModel> DangKyKhoaHocs { get; set; }
        public DbSet<TienDoBaiHocModel> TienDoBaiHocs { get; set; }
        public DbSet<DanhGiaModel> DanhGias { get; set; }
        public DbSet<BinhLuanModel> BinhLuans { get; set; }
        public DbSet<BaiTapModel> BaiTaps { get; set; }
        public DbSet<BaiTap_ThucHanhIDEModel> BaiTap_ThucHanhIDEs { get; set; }
        public DbSet<BaiTap_QuizModel> BaiTap_Quizs { get; set; }
        public DbSet<BoThuNghiemModel> BoThuNghiems { get; set; }
        public DbSet<KetQuaLamBaiModel> KetQuaLamBais { get; set; }
        public DbSet<LoTrinhAIModel> LoTrinhAIs { get; set; }
        public DbSet<GhiChuAIModel> GhiChuAIs { get; set; }
        public DbSet<GhiChuBaiHocModel> GhiChuBaiHocs { get; set; }
        public DbSet<GoiYAI_TaoBaiTapModel> GoiYAI_TaoBaiTapS { get; set; }
        public DbSet<PhienBanBaiTapModel> PhienBanBaiTaps { get; set; }
        public DbSet<RangBuocBaiTapModel> RangBuocBaiTaps { get; set; }
        public DbSet<LoiGiaiMauModel> LoiGiaiMaus { get; set; }

        public DbSet<KeyAPIModel> KeyAPIs { get; set; }
        public DbSet<NhatKySuDungModel> NhatKySuDungs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ====== INDEXES ======
            modelBuilder.Entity<NguoiDungModel>().HasIndex(u => u.TaiKhoan).IsUnique();
            modelBuilder.Entity<NguoiDungModel>().HasIndex(u => u.Email).IsUnique();
            modelBuilder.Entity<TienDoBaiHocModel>().HasIndex(t => new { t.MaNguoiDung, t.MaBaiHoc }).IsUnique();
            modelBuilder.Entity<BaiTap_ThucHanhIDEModel>().HasIndex(b => new { b.MaBaiTap, b.MaNgonNgu }).IsUnique();
            modelBuilder.Entity<DanhGiaModel>().HasIndex(d => new { d.MaNguoiDung, d.MaKhoaHoc }).IsUnique();

            // ====== RELATIONSHIPS CONFIGURATION ======

            // NguoiDungModel relationships
            modelBuilder.Entity<NguoiDungModel>()
                .HasMany(n => n.DanhSachPhienDangNhap)
                .WithOne(p => p.NguoiDung)
                .HasForeignKey(p => p.MaNguoiDung)
                .OnDelete(DeleteBehavior.Cascade);

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
                .WithOne(kq => kq.NguoiDung)
                .HasForeignKey(kq => kq.MaNguoiDung)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<NguoiDungModel>()
                .HasMany(n => n.LoTrinhAIs)
                .WithOne(l => l.NguoiDung)
                .HasForeignKey(l => l.MaNguoiDung)
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
                .HasOne(bt => bt.BaiTap_NgonNgus)
                .WithOne(btn => btn.BaiTap)
                .HasForeignKey<BaiTap_ThucHanhIDEModel>(btn => btn.MaBaiTap)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<BaiTapModel>()
                .HasOne(bt => bt.BaiTap_Quiz)
                .WithOne(bq => bq.BaiTap)
                .HasForeignKey<BaiTap_QuizModel>(bq => bq.MaBaiTap)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<BaiTapModel>()
                .HasMany(bt => bt.KetQuaBaiTaps)
                .WithOne(kq => kq.BaiTap)
                .HasForeignKey(kq => kq.MaBaiTap)
                .OnDelete(DeleteBehavior.NoAction);

            // BaiTap_ThucHanhIDEModel relationships
            modelBuilder.Entity<BaiTap_ThucHanhIDEModel>()
                 .HasMany(btn => btn.BoThuNghiems)
                 .WithOne(bth => bth.BaiTap_ThucHanh)
                 .HasForeignKey(bth => bth.MaBaiTapThucHanh)
                 .OnDelete(DeleteBehavior.NoAction);

            // 1. LoiGiaiMauModel
            modelBuilder.Entity<LoiGiaiMauModel>()
                .HasOne(l => l.BaiTapThucHanh)
                .WithMany() // Giả sử bên IDE không cần List<LoiGiaiMau>
                .HasForeignKey(l => l.MaBaiTapThucHanh)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<LoiGiaiMauModel>()
                .HasOne(l => l.NgonNguLapTrinh)
                .WithMany()
                .HasForeignKey(l => l.MaNgonNgu)
                .OnDelete(DeleteBehavior.NoAction);

            // 2. RangBuocBaiTapModel
            modelBuilder.Entity<RangBuocBaiTapModel>()
                .HasOne(r => r.BaiTapThucHanh)
                .WithMany()
                .HasForeignKey(r => r.MaBaiTapThucHanh)
                .OnDelete(DeleteBehavior.NoAction);

            // 3. PhienBanBaiTapModel
            modelBuilder.Entity<PhienBanBaiTapModel>()
                .HasOne(p => p.BaiTapThucHanh)
                .WithMany()
                .HasForeignKey(p => p.MaBaiTapThucHanh)
                .OnDelete(DeleteBehavior.NoAction);

            // 4. GoiYAI_TaoBaiTapModel
            modelBuilder.Entity<GoiYAI_TaoBaiTapModel>()
                .HasOne(g => g.BaiTapThucHanh)
                .WithMany()
                .HasForeignKey(g => g.MaBaiTapThucHanh)
                .OnDelete(DeleteBehavior.NoAction);


            // NgonNguLapTrinhModel relationships
            modelBuilder.Entity<NgonNguLapTrinhModel>()
                .HasMany(n => n.BaiTap_NgonNgus)
                .WithOne(btn => btn.NgonNgu)
                .HasForeignKey(btn => btn.MaNgonNgu)
                .OnDelete(DeleteBehavior.NoAction);

            // BinhLuanModel self-referencing relationship
            modelBuilder.Entity<BinhLuanModel>()
                .HasOne(b => b.BinhLuanCha)
                .WithMany(b => b.BinhLuans)
                .HasForeignKey(b => b.MaBinhLuanCha)
                .OnDelete(DeleteBehavior.NoAction);


            // ====== SEED DATA ======
            KhoaHocDuLieu.SeedKhoaHoc(modelBuilder);
            ChuongHocDuLieu.SeedChuongHoc(modelBuilder);
            BaiHocDuLieu.SeedBaiHoc(modelBuilder);
            NguoiDungDuLieu.SeedNguoiDung(modelBuilder);
        }
    }
}

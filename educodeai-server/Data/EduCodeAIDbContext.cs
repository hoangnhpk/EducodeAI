using educodeai_server.Data.DuLieuMau;
using educodeai_server.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
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
        public DbSet<KhoaHocModel> KhoaHocs { get; set; }
        public DbSet<ChuongHocModel> ChuongHocs { get; set; }
        public DbSet<BaiHocModel> BaiHocs { get; set; }
        public DbSet<DangKyKhoaHocModel> DangKyKhoaHocs { get; set; }
        public DbSet<TienDoBaiHocModel> TienDoBaiHocs { get; set; }
        public DbSet<DanhGiaModel> DanhGias { get; set; }
        public DbSet<BinhLuanModel> BinhLuans { get; set; }
        public DbSet<BaiTapModel> BaiTaps { get; set; }
        public DbSet<BaiTap_QuizModel> BaiTap_Quizs { get; set; }
        public DbSet<BaiTapThucHanhModel> BaiTapThucHanhs { get; set; }
        public DbSet<TestCaseThucHanhModel> TestCaseThucHanhs { get; set; }
        public DbSet<KetQuaLamBaiModel> KetQuaLamBais { get; set; }
        public DbSet<LoTrinhAIModel> LoTrinhAIs { get; set; }
        public DbSet<GhiChuAIModel> GhiChuAIs { get; set; }
        public DbSet<GhiChuBaiHocModel> GhiChuBaiHocs { get; set; }
public DbSet<VideoChapterModel> VideoChapters { get; set; }
public DbSet<VideoQuizModel> VideoQuizs { get; set; }
        public DbSet<KeyAPIModel> KeyAPIs { get; set; }
        public DbSet<NhatKySuDungModel> NhatKySuDungs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            foreach (var entity in modelBuilder.Model.GetEntityTypes())
            {
                foreach (var property in entity.GetProperties())
                {
                    if (property.ClrType == typeof(DateTime))
                    {
                        property.SetValueConverter(
                            new ValueConverter<DateTime, DateTime>(
                                v => v.ToUniversalTime(),
                                v => DateTime.SpecifyKind(v, DateTimeKind.Utc)
                            ));
                    }
                }
            }
            base.OnModelCreating(modelBuilder);

            // ====== INDEXES ======
            modelBuilder.Entity<NguoiDungModel>().HasIndex(u => u.TaiKhoan).IsUnique();
            modelBuilder.Entity<NguoiDungModel>().HasIndex(u => u.Email).IsUnique();
            modelBuilder.Entity<TienDoBaiHocModel>().HasIndex(t => new { t.MaNguoiDung, t.MaBaiHoc }).IsUnique();
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
                .HasOne(bt => bt.BaiTap_ThucHanh)
                .WithOne(bth => bth.BaiTap)
                .HasForeignKey<BaiTapThucHanhModel>(bth => bth.MaBaiTap)
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

            // BaiTapThucHanhModel relationships
            modelBuilder.Entity<BaiTapThucHanhModel>()
                 .HasMany(bth => bth.TestCases)
                 .WithOne(tc => tc.BaiTapThucHanh)
                 .HasForeignKey(tc => tc.MaBaiTapThucHanh)
                 .OnDelete(DeleteBehavior.Cascade);

            // BinhLuanModel self-referencing relationship
            modelBuilder.Entity<BinhLuanModel>()
                .HasOne(b => b.BinhLuanCha)
                .WithMany(b => b.BinhLuans)
                .HasForeignKey(b => b.MaBinhLuanCha)
                .OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<BaiHocModel>()
                .HasMany(b => b.VideoChapters)
                .WithOne(c => c.BaiHoc)
                .HasForeignKey(c => c.MaBaiHoc)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<VideoChapterModel>()
                .HasMany(c => c.VideoQuizs)
                .WithOne(q => q.Chapter)
                .HasForeignKey(q => q.MaChapter)
                .OnDelete(DeleteBehavior.Cascade);

            // ====== SEED DATA ======
            KhoaHocDuLieu.SeedKhoaHoc(modelBuilder);
            ChuongHocDuLieu.SeedChuongHoc(modelBuilder);
            BaiHocDuLieu.SeedBaiHoc(modelBuilder);
            NguoiDungDuLieu.SeedNguoiDung(modelBuilder);

            
        }
    }
}

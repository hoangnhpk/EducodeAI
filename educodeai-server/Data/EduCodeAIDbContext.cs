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

        // 16 báº£ng dá»¯ liá»‡u
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
        public DbSet<KetQuaKiemTraChungChiModel> KetQuaKiemTraChungChis { get; set; }
        public DbSet<ChungChiKhoaHocModel> ChungChiKhoaHocs { get; set; }
        public DbSet<CauHinhHeThongModel> CauHinhs { get; set; }
        public DbSet<LoTrinhAIModel> LoTrinhAIs { get; set; }
        public DbSet<GhiChuAIModel> GhiChuAIs { get; set; }
        public DbSet<GhiChuBaiHocModel> GhiChuBaiHocs { get; set; }
        public DbSet<VideoChapterModel> VideoChapters { get; set; }
        public DbSet<VideoQuizModel> VideoQuizs { get; set; }
        public DbSet<KeyAPIModel> KeyAPIs { get; set; }
        public DbSet<ApiKeyAuditLog> ApiKeyAuditLogs { get; set; }
        public DbSet<NhatKySuDungModel> NhatKySuDungs { get; set; }
        public DbSet<DonHangKhoaHocModel> DonHangKhoaHocs { get; set; }
        public DbSet<ChiTietDonHangModel> ChiTietDonHangs { get; set; }
        public DbSet<GiaoDichThanhToanModel> GiaoDichThanhToans { get; set; }
        public DbSet<ThongBaoEmailThanhToanModel> ThongBaoEmailThanhToans { get; set; }
        public DbSet<MaGiamGiaModel> MaGiamGias { get; set; }
        public DbSet<MaGiamGiaKhoaHocModel> MaGiamGiaKhoaHocs { get; set; }
        public DbSet<DoanhThuGiangVienModel> DoanhThuGiangViens { get; set; }
        public DbSet<QuaTangKhoaHocModel> QuaTangKhoaHocs { get; set; }
        public DbSet<MaQuaTangHocVienModel> MaQuaTangHocViens { get; set; }
        public DbSet<YeuCauRutTienGiangVienModel> YeuCauRutTienGiangViens { get; set; }
        public DbSet<HoTroRutTienGiangVienModel> HoTroRutTienGiangViens { get; set; }
        public DbSet<HoSoDangKyGiangVienModel> HoSoDangKyGiangViens { get; set; }
        public DbSet<DanhHieuModel> DanhHieus { get; set; }
        public DbSet<MauNhiemVuTuanModel> MauNhiemVuTuans { get; set; }
        public DbSet<NguoiDungGamificationModel> NguoiDungGamifications { get; set; }
        public DbSet<NguoiDungDanhHieuModel> NguoiDungDanhHieus { get; set; }
        public DbSet<TienDoNhiemVuTuanModel> TienDoNhiemVuTuans { get; set; }
        public DbSet<WebhookLogModel> WebhookLogs { get; set; }
        public DbSet<GiangVienQuotaModel> GiangVienQuotas { get; set; }
        public DbSet<AIBalanceHoldModel> AIBalanceHolds { get; set; }
        public DbSet<LichSuPhongVanModel> LichSuPhongVans { get; set; }

        public DbSet<DoAnThucChienModel> DoAnThucChiens { get; set; }
        public DbSet<ChungChiDoAnModel> ChungChiDoAns { get; set; }

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

            modelBuilder.Entity<ChungChiKhoaHocModel>().HasIndex(c => c.MaChungChi).IsUnique();
            modelBuilder.Entity<ChungChiKhoaHocModel>().HasIndex(c => new { c.MaNguoiDung, c.MaKhoaHoc }).IsUnique();

            modelBuilder.Entity<DonHangKhoaHocModel>().HasIndex(d => d.IdempotencyKey).IsUnique();
            modelBuilder.Entity<GiaoDichThanhToanModel>().HasIndex(g => g.MaThamChieuNgoai).IsUnique();
            modelBuilder.Entity<ThongBaoEmailThanhToanModel>()
                .HasIndex(x => new { x.MaDonHang, x.LoaiThongBao, x.EmailNhan }).IsUnique();
            modelBuilder.Entity<MaGiamGiaModel>().HasIndex(v => v.Code).IsUnique();
            modelBuilder.Entity<MaGiamGiaKhoaHocModel>().HasIndex(x => new { x.MaVoucher, x.MaKhoaHoc }).IsUnique();
            modelBuilder.Entity<YeuCauRutTienGiangVienModel>().HasIndex(x => x.NoiDungChuyenKhoan).IsUnique();
            modelBuilder.Entity<YeuCauRutTienGiangVienModel>().HasIndex(x => x.MaGiaoDichSePay).IsUnique();
            modelBuilder.Entity<HoTroRutTienGiangVienModel>().HasIndex(x => new { x.MaYeuCauRutTien, x.TrangThaiHoTro });
            modelBuilder.Entity<QuaTangKhoaHocModel>().HasIndex(x => new { x.MaKhoaHoc, x.MaNguoiNhan, x.TrangThai });
            modelBuilder.Entity<QuaTangKhoaHocModel>().HasIndex(x => new { x.MaNguoiTang, x.MaKhoaHoc, x.CreatedAt });
            modelBuilder.Entity<MaQuaTangHocVienModel>().HasIndex(x => x.Code).IsUnique();
            modelBuilder.Entity<MaQuaTangHocVienModel>().HasIndex(x => new { x.MaNguoiTang, x.TrangThai, x.CreatedAt });
            modelBuilder.Entity<HoSoDangKyGiangVienModel>().HasIndex(x => x.Email);
            modelBuilder.Entity<HoSoDangKyGiangVienModel>().HasIndex(x => x.MaNguoiDung).IsUnique();


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
                .HasMany(n => n.KetQuaKiemTraChungChis)
                .WithOne(kq => kq.NguoiDung)
                .HasForeignKey(kq => kq.MaNguoiDung)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<NguoiDungModel>()
                .HasMany(n => n.ChungChiKhoaHocs)
                .WithOne(c => c.NguoiDung)
                .HasForeignKey(c => c.MaNguoiDung)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<NguoiDungModel>()
                .HasMany(n => n.LoTrinhAIs)
                .WithOne(l => l.NguoiDung)
                .HasForeignKey(l => l.MaNguoiDung)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<NguoiDungModel>()
                .HasMany(n => n.DonHangKhoaHocs)
                .WithOne(d => d.NguoiDung)
                .HasForeignKey(d => d.MaNguoiDung)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<NguoiDungModel>()
                .HasMany(n => n.MaGiamGiaDaTao)
                .WithOne(v => v.NguoiTao)
                .HasForeignKey(v => v.MaNguoiTao)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<NguoiDungModel>()
                .HasMany(n => n.MaQuaTangDaTao)
                .WithOne(x => x.NguoiTang)
                .HasForeignKey(x => x.MaNguoiTang)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<NguoiDungModel>()
                .HasMany(n => n.MaQuaTangDaNhan)
                .WithOne(x => x.NguoiNhan)
                .HasForeignKey(x => x.MaNguoiNhan)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<NguoiDungModel>()
                .HasMany(n => n.QuaTangDaTang)
                .WithOne(q => q.NguoiTang)
                .HasForeignKey(q => q.MaNguoiTang)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<NguoiDungModel>()
                .HasMany(n => n.QuaTangDaNhan)
                .WithOne(q => q.NguoiNhan)
                .HasForeignKey(q => q.MaNguoiNhan)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<NguoiDungModel>()
                .HasMany(n => n.DoanhThuGiangViens)
                .WithOne(dt => dt.GiangVien)
                .HasForeignKey(dt => dt.MaGiangVien)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<NguoiDungModel>()
                .HasMany(n => n.YeuCauRutTienGiangViens)
                .WithOne(x => x.GiangVien)
                .HasForeignKey(x => x.MaGiangVien)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<NguoiDungModel>()
                .HasMany(n => n.YeuCauDaDuyets)
                .WithOne(x => x.QuanTriVienDuyet)
                .HasForeignKey(x => x.MaQuanTriVienDuyet)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<NguoiDungModel>()
                .HasMany(n => n.HoTroRutTienGiangViens)
                .WithOne(x => x.GiangVien)
                .HasForeignKey(x => x.MaGiangVien)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<NguoiDungModel>()
                .HasMany(n => n.HoTroRutTienDaXuLys)
                .WithOne(x => x.QuanTriVienXuLy)
                .HasForeignKey(x => x.MaQuanTriVienXuLy)
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

            // Cáº¥u hÃ¬nh tá»« nhÃ¡nh dev (HEAD)
            modelBuilder.Entity<KhoaHocModel>()
                .HasMany(k => k.KetQuaKiemTraChungChis)
                .WithOne(kq => kq.KhoaHoc)
                .HasForeignKey(kq => kq.MaKhoaHoc)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<KhoaHocModel>()
                .HasMany(k => k.ChungChiKhoaHocs)
                .WithOne(c => c.KhoaHoc)
                .HasForeignKey(c => c.MaKhoaHoc)
                .OnDelete(DeleteBehavior.NoAction);

            // Cáº¥u hÃ¬nh tá»« nhÃ¡nh Hoang1
            modelBuilder.Entity<KhoaHocModel>()
                .HasMany(k => k.ChiTietDonHangs)
                .WithOne(c => c.KhoaHoc)
                .HasForeignKey(c => c.MaKhoaHoc)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<KhoaHocModel>()
                .HasMany(k => k.QuaTangKhoaHocs)
                .WithOne(q => q.KhoaHoc)
                .HasForeignKey(q => q.MaKhoaHoc)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<KhoaHocModel>()
                .HasMany(k => k.MaGiamGiaKhoaHocs)
                .WithOne(x => x.KhoaHoc)
                .HasForeignKey(x => x.MaKhoaHoc)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<KhoaHocModel>()
                .HasMany(k => k.MaQuaTangHocViens)
                .WithOne(x => x.KhoaHoc)
                .HasForeignKey(x => x.MaKhoaHoc)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<KhoaHocModel>()
                .ToTable(t => t.HasCheckConstraint("CK_KhoaHocs_GiaKhoaHoc_Range", "\"GiaKhoaHoc\" >= 10000 AND \"GiaKhoaHoc\" <= 15000"));


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
                .HasOne(bt => bt.BaiTapThucHanh)
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

            modelBuilder.Entity<ChungChiKhoaHocModel>()
                .HasOne(c => c.KetQuaKiemTraChungChi)
                .WithMany()
                .HasForeignKey(c => c.MaKetQuaKiemTraChungChi)
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

            modelBuilder.Entity<DonHangKhoaHocModel>()
                .HasMany(d => d.ChiTietDonHangs)
                .WithOne(c => c.DonHang)
                .HasForeignKey(c => c.MaDonHang)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DonHangKhoaHocModel>()
                .HasMany(d => d.GiaoDichThanhToans)
                .WithOne(g => g.DonHang)
                .HasForeignKey(g => g.MaDonHang)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DonHangKhoaHocModel>()
                .HasMany(d => d.ThongBaoEmailThanhToans)
                .WithOne(t => t.DonHang)
                .HasForeignKey(t => t.MaDonHang)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DonHangKhoaHocModel>()
                .HasMany(d => d.MaQuaTangHocViens)
                .WithOne(x => x.DonHang)
                .HasForeignKey(x => x.MaDonHang)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DonHangKhoaHocModel>()
                .HasOne(d => d.Voucher)
                .WithMany(v => v.DonHangSuDung)
                .HasForeignKey(d => d.MaVoucher)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<MaGiamGiaModel>()
                .HasMany(v => v.DanhSachKhoaHocApDung)
                .WithOne(x => x.Voucher)
                .HasForeignKey(x => x.MaVoucher)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<YeuCauRutTienGiangVienModel>()
                .ToTable(t => t.HasCheckConstraint("CK_YeuCauRutTienGiangVien_SoTienYeuCau_Duong", "\"SoTienYeuCau\" > 0"));

            modelBuilder.Entity<YeuCauRutTienGiangVienModel>()
                .HasMany(x => x.YeuCauHoTro)
                .WithOne(x => x.YeuCauRutTien)
                .HasForeignKey(x => x.MaYeuCauRutTien)
                .OnDelete(DeleteBehavior.Cascade);

            // === RELATIONSHIPS: DoAnThucChien ===
            modelBuilder.Entity<DoAnThucChienModel>()
                .HasIndex(d => new { d.MaNguoiDung, d.NgayNop });

            modelBuilder.Entity<NguoiDungModel>()
                .HasMany<DoAnThucChienModel>()
                .WithOne(d => d.NguoiDung)
                .HasForeignKey(d => d.MaNguoiDung)
                .OnDelete(DeleteBehavior.NoAction);

            // === RELATIONSHIPS: ChungChiDoAn ===
            modelBuilder.Entity<ChungChiDoAnModel>()
                .HasIndex(c => c.MaChungChi).IsUnique();

            modelBuilder.Entity<ChungChiDoAnModel>()
                .HasIndex(c => new { c.MaNguoiDung, c.MaDoAn }).IsUnique();

            modelBuilder.Entity<DoAnThucChienModel>()
                .HasOne(d => d.ChungChiDoAn)
                .WithOne(c => c.DoAn)
                .HasForeignKey<ChungChiDoAnModel>(c => c.MaDoAn)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<NguoiDungModel>()
                .HasMany<ChungChiDoAnModel>()
                .WithOne(c => c.NguoiDung)
                .HasForeignKey(c => c.MaNguoiDung)
                .OnDelete(DeleteBehavior.NoAction);

            // ====== GAMIFICATION / THỬ THÁCH ======
            modelBuilder.Entity<TienDoNhiemVuTuanModel>()
                .HasIndex(t => new { t.MaNguoiDung, t.MaMau, t.DauChuKy })
                .IsUnique();

            modelBuilder.Entity<NguoiDungDanhHieuModel>()
                .HasIndex(x => new { x.MaNguoiDung, x.MaDanhHieu })
                .IsUnique();

            modelBuilder.Entity<NguoiDungGamificationModel>()
                .HasOne(g => g.NguoiDung)
                .WithOne()
                .HasForeignKey<NguoiDungGamificationModel>(g => g.MaNguoiDung)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<NguoiDungGamificationModel>()
                .HasOne(g => g.DanhHieuDangDeo)
                .WithMany()
                .HasForeignKey(g => g.MaDanhHieuDangDeo)
                .OnDelete(DeleteBehavior.SetNull);

            // ====== SEED DATA ======
            KhoaHocDuLieu.SeedKhoaHoc(modelBuilder);
            ChuongHocDuLieu.SeedChuongHoc(modelBuilder);
            BaiHocDuLieu.SeedBaiHoc(modelBuilder);
            NguoiDungDuLieu.SeedNguoiDung(modelBuilder);
            MarketplaceDuLieu.SeedMarketplace(modelBuilder);

            
        }
    }
}


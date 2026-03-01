using educodeai_server.DTOs.AI;
using educodeai_server.DTOs.KhoaHoc;
using educodeai_server.Models;
using educodeai_server.Repository.Interface;
using educodeai_server.Services.Interface;

namespace educodeai_server.Services.Implementation
{
    public class KhoaHocService : IKhoaHocService
    {
        private readonly IKhoaHocRepository _khoaHocRepository;

        public KhoaHocService(IKhoaHocRepository khoaHocRepository)
        {
            _khoaHocRepository = khoaHocRepository;
        }

        // ============================================================
        // ĐÂY LÀ HÀM BẠN ĐANG THIẾU - COPY CHÍNH XÁC DÒNG NÀY
        // ============================================================
        public async Task<IEnumerable<KhoaHocDto>> GetAllKhoaHocsAsync()
        {
            return await _khoaHocRepository.GetAllKhoaHocsAsync();
        }

        // ============================================================
        // CÁC HÀM CÒN LẠI GIỮ NGUYÊN
        // ============================================================
        public async Task<KhoaHoc_NoiDungKhoaHocDTO?> GetKhoaHocByIdAsync(int maKhoaHoc, int maNguoiDung)
        {
            return await _khoaHocRepository.GetNoiDungKhoaHocAsync(maKhoaHoc, maNguoiDung);
        }

        public async Task<bool> LuuTienDoBaiHoc(TienDoBaiHocDTO dto)
        {
            return await _khoaHocRepository.LuuTienDoBaiHoc(dto);
        }

        public async Task<bool> LuuGhiChuBaiHoc(GhiChuBaiHocDTO dto)
        {
            return await _khoaHocRepository.LuuGhiChuBaiHoc(dto);
        }

        public async Task<List<GhiChuBaiHocDTO>> GetGhiChuBaiHocAsync(int maBaiHoc, int maNguoiDung)
        {
            return await _khoaHocRepository.GetGhiChuBaiHocAsync(maBaiHoc, maNguoiDung);
        }

        public async Task<bool> LuuKetQuaBaiTap(KetQuaQuizSubmitDTO dto)
        {
            return await _khoaHocRepository.LuuKetQuaBaiTap(dto);
        }

        public async Task<List<GhiChuAIModel>> LayGhiChuAI(int maNguoiDung)
        {
            var ketQua = await _khoaHocRepository.LayDanhSachGhiChuAI(maNguoiDung);
            return ketQua;
        }

        public async Task<bool> LuuGhiChuAI(LuuGhiChuAIRequest yeuCau)
        {
            var duLieu = new GhiChuAIModel
            {
                MaNguoiDung = 2,
                MaBaiHoc = yeuCau.MaBaiHoc,
                NoiDung = yeuCau.NoiDung,
                NgayTao = DateTime.Now,
                NgayCapNhat = DateTime.Now
            };
            var ketQua = await _khoaHocRepository.LuuGhiChuAI(duLieu);
            return ketQua;
        }

        public async Task<bool> UpdateGhiChuAI(UpdateGhiChuAIDTO dto)
        {
            if (string.IsNullOrEmpty(dto.NoiDung)) return false;
            return await _khoaHocRepository.UpdateGhiChuAI(dto.Id, dto.NoiDung);
        }

        public async Task<bool> DeleteGhiChuAI(int id)
        {
            return await _khoaHocRepository.DeleteGhiChuAI(id);
        }

        public async Task<object> LayThongKeVaDanhSachAsync(int maKhoaHoc)
        {
            var danhSachRaw = await _khoaHocRepository.LayDanhSachTheoKhoaHocAsync(maKhoaHoc);

            var tongSo = danhSachRaw.Count;
            // Tính trung bình cộng số sao, làm tròn 1 chữ số thập phân
            var trungBinh = tongSo > 0 ? Math.Round(danhSachRaw.Average(x => x.SoSao), 1) : 0;

            var thongKe = new
            {
                TrungBinh = trungBinh,
                TongSo = tongSo,
                TyLe = new
                {
                    sao5 = tongSo > 0 ? (danhSachRaw.Count(x => x.SoSao == 5) * 100) / tongSo : 0,
                    sao4 = tongSo > 0 ? (danhSachRaw.Count(x => x.SoSao == 4) * 100) / tongSo : 0,
                    sao3 = tongSo > 0 ? (danhSachRaw.Count(x => x.SoSao == 3) * 100) / tongSo : 0,
                    sao2 = tongSo > 0 ? (danhSachRaw.Count(x => x.SoSao == 2) * 100) / tongSo : 0,
                    sao1 = tongSo > 0 ? (danhSachRaw.Count(x => x.SoSao == 1) * 100) / tongSo : 0,
                }
            };

            var danhSachOutput = danhSachRaw.Select(x => new {
                id = x.MaDanhGia,
                tenNguoiDung = x.NguoiDung?.HoTen ?? "Học viên",
                maNguoiDung = x.MaNguoiDung,
                soSao = x.SoSao,
                noiDung = x.NhanXet,
                ngayTao = x.NgayDanhGia
            }).ToList();

            return new { ThongKe = thongKe, DanhSach = danhSachOutput };
        }

        public async Task<bool> TaoDanhGiaMoiAsync(DanhGiaDTO yeuCau)
        {
            bool daHocXong = await _khoaHocRepository.KiemTraHoanThanhKhoaHocAsync(yeuCau.MaKhoaHoc, yeuCau.MaNguoiDung);
            if (!daHocXong)
            {
                throw new Exception("Bạn phải hoàn thành 100% khóa học mới được phép đánh giá!");
            }
            // 1 user chỉ được đánh giá 1 lần cho 1 khóa học
            bool daTonTai = await _khoaHocRepository.KiemTraDaDanhGiaAsync(yeuCau.MaKhoaHoc, yeuCau.MaNguoiDung);
            if (daTonTai) throw new Exception("Bạn đã đánh giá khóa học này rồi!");

            var model = new DanhGiaModel
            {
                MaKhoaHoc = yeuCau.MaKhoaHoc,
                MaNguoiDung = yeuCau.MaNguoiDung,
                SoSao = yeuCau.SoSao,
                NhanXet = yeuCau.NhanXet,
                NgayDanhGia = DateTime.Now
            };

            return await _khoaHocRepository.ThemDanhGiaAsync(model);
        }
    }
}
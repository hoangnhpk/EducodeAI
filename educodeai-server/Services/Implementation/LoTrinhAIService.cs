using System.Text.Json;
using educodeai_server.DTOs.AI;
using educodeai_server.Helpers;
using educodeai_server.Models;
using educodeai_server.Repository.Interface;
using educodeai_server.Services.Interface;

namespace educodeai_server.Services.Implementation
{
    public class LoTrinhAIService : ILoTrinhAIService
    {
        private readonly IKhoaHocRepository _khoaHocRepo;
        private readonly ILoTrinhAIRepository _loTrinhRepo;
        private readonly IGeminiAIService _gemini;

        public LoTrinhAIService(
            IKhoaHocRepository khoaHocRepo,
            ILoTrinhAIRepository loTrinhRepo,
            IGeminiAIService gemini)
        {
            _khoaHocRepo = khoaHocRepo;
            _loTrinhRepo = loTrinhRepo;
            _gemini = gemini;
        }

        public async Task<LoTrinhAIResponseDto> TaoLoTrinhAsync(
            int maNguoiDung,
            CreateLoTrinhAIDto dto)
        {
            // Validate
            if(string.IsNullOrEmpty(dto.MucTieuNgheNghiep))
            {
                throw new ArgumentException("Mục tiêu nghề nghiệp không được để trống.");
            }    

            // Lấy khoá học phù hợp
            var khoaHoc = await _khoaHocRepo.GetKhoaHocPhuHopAsync(dto);

            // Serialize JSON
            var khoaHocJson = JsonSerializer.Serialize(khoaHoc);

            // Build prompt
            var prompt = PromptBuilder.Build(dto, khoaHocJson);

            // Call AI
            var aiResult = await _gemini.GenerateAsync(prompt);

            // Save DB
            var loTrinh = new LoTrinhAIModel
            {
                MaNguoiDung = 8,
                YeuCau = prompt,
                NoiDungJSON = aiResult,
                TrangThai = "Generated",
                NgayTao = DateTime.Now
            };

            await _loTrinhRepo.AddAsync(loTrinh);

            return new LoTrinhAIResponseDto
            {
                MaLoTrinh = loTrinh.MaLoTrinh,
                NoiDungJSON = aiResult
            };
        }
    }

}

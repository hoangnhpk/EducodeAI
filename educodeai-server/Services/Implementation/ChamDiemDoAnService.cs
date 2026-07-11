using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using educodeai_server.DTOs.AI;
using educodeai_server.Helpers;
using educodeai_server.Services.Interface;
using Microsoft.Extensions.Logging;

namespace educodeai_server.Services.Implementation
{
    public class ChamDiemDoAnService : IChamDiemDoAnService
    {
        private readonly IGeminiToolCallingService _geminiService;
        private readonly ILogger<ChamDiemDoAnService> _logger;

        public ChamDiemDoAnService(IGeminiToolCallingService geminiService, ILogger<ChamDiemDoAnService> logger)
        {
            _geminiService = geminiService;
            _logger = logger;
        }

        public async Task<KetQuaChamDiemDoAnDto> ChamDiemDoAnZipAsync(int userId, NopDoAnZipRequestDto request)
        {
            string sessionId = Guid.NewGuid().ToString();
            string tempFolder = Path.Combine(Path.GetTempPath(), "EduCodeAI", userId.ToString(), sessionId);

            try
            {
                // 1. Giải nén và lọc file
                ZipAndFileTreeHelper.GiaiNenVaLocRac(request.ZipFile, tempFolder, request.MatKhau);
                string fileTree = ZipAndFileTreeHelper.TaoCayThuMuc(tempFolder);

                // 2. Định nghĩa Tools cho Gemini
                var tools = new[]
                {
                    new
                    {
                        function_declarations = new[]
                        {
                            new
                            {
                                name = "DocFile",
                                description = "Đọc nội dung của một file bất kỳ trong dự án để kiểm tra code.",
                                parameters = new
                                {
                                    type = "OBJECT",
                                    properties = new
                                    {
                                        filePath = new { type = "STRING", description = "Đường dẫn file (ví dụ: src/index.js hoặc Program.cs)" }
                                    },
                                    required = new[] { "filePath" }
                                }
                            }
                        }
                    }
                };

                // 3. Khởi tạo Context
                string systemPrompt = $@"Bạn là một Giám khảo AI chấm điểm đồ án lập trình.
Yêu cầu đồ án: {request.YeuCauDoAn}

Dưới đây là cấu trúc thư mục dự án của học viên:
{fileTree}

Bạn có thể dùng công cụ 'DocFile' để xem chi tiết code bên trong. Hãy kiểm tra các file quan trọng nhất để xem học viên có làm đúng yêu cầu không.
Chỉ gọi hàm 'DocFile' TỐI ĐA 5 LẦN. Sau khi đã thu thập đủ bằng chứng, hãy đưa ra kết quả cuối cùng ở định dạng JSON như sau, không kèm bất kỳ markdown nào khác:
{{
    ""diem"": (từ 0.0 đến 10.0),
    ""nhanXet"": ""Nhận xét chi tiết...""
}}";

                var contents = new List<object>
                {
                    new { role = "user", parts = new[] { new { text = systemPrompt } } }
                };

                // 4. Vòng lặp Agentic (Tối đa 7 lượt để tránh loop vô hạn)
                for (int i = 0; i < 7; i++)
                {
                    string geminiResponseJson = await _geminiService.GenerateWithToolsAsync(contents, tools);
                    
                    // Parse response
                    var responseObj = JsonDocument.Parse(geminiResponseJson).RootElement;
                    if (!responseObj.TryGetProperty("candidates", out var candidates) || candidates.GetArrayLength() == 0)
                    {
                        throw new Exception("Gemini trả về rỗng.");
                    }

                    var firstCandidate = candidates[0];
                    var parts = firstCandidate.GetProperty("content").GetProperty("parts");

                    bool hasFunctionCall = false;
                    foreach (var part in parts.EnumerateArray())
                    {
                        if (part.TryGetProperty("functionCall", out var functionCall))
                        {
                            hasFunctionCall = true;
                            string functionName = functionCall.GetProperty("name").GetString();
                            var args = functionCall.GetProperty("args");

                            if (functionName == "DocFile")
                            {
                                string filePath = args.GetProperty("filePath").GetString();
                                string fileContent = DocFileLocal(tempFolder, filePath);

                                // Append Gemini's request to contents
                                contents.Add(new { role = "model", parts = new[] { new { functionCall = functionCall } } });

                                // Append Tool response to contents
                                contents.Add(new
                                {
                                    role = "function",
                                    parts = new[]
                                    {
                                        new
                                        {
                                            functionResponse = new
                                            {
                                                name = "DocFile",
                                                response = new { name = "DocFile", content = fileContent }
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    }

                    if (!hasFunctionCall)
                    {
                        // AI đã trả về Text kết quả JSON
                        string finalText = parts[0].GetProperty("text").GetString();
                        string cleanJson = ChuanHoaJsonTuAIHelper.ExtractJson(finalText);
                        var result = JsonSerializer.Deserialize<KetQuaChamDiemDoAnDto>(cleanJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                        return result;
                    }
                }

                throw new Exception("Vượt quá số lần gọi hàm tối đa mà AI vẫn chưa ra quyết định.");
            }
            finally
            {
                // 5. Clean up
                if (Directory.Exists(tempFolder))
                {
                    Directory.Delete(tempFolder, true);
                }
            }
        }

        private string DocFileLocal(string baseFolder, string relativePath)
        {
            try
            {
                // Prevent directory traversal
                string fullPath = Path.GetFullPath(Path.Combine(baseFolder, relativePath.Replace("/", "\\")));
                if (!fullPath.StartsWith(Path.GetFullPath(baseFolder), StringComparison.OrdinalIgnoreCase))
                {
                    return "LỖI BẢO MẬT: Đường dẫn không hợp lệ.";
                }

                if (!File.Exists(fullPath))
                {
                    return $"File không tồn tại: {relativePath}";
                }

                return File.ReadAllText(fullPath);
            }
            catch (Exception ex)
            {
                return $"Lỗi đọc file: {ex.Message}";
            }
        }
    }
}

using educodeai_server.DTOs.BaiTap;

namespace educodeai_server.Services.Implementation
{
    public class BaiTapService
    {
        private readonly HttpClient _httpClient;

        // SỬA 2 DÒNG NÀY THÀNH MÃ BẠN VỪA COPY Ở BƯỚC 1
        private readonly string _clientId = "d94570b0ee42b76d8c4a3b0c1367d9a5";
        private readonly string _clientSecret = "4d3135fa4a9ad1391812e557c1ba0350a7f0bbd48f65a6938b37627c036d18a";

        public BaiTapService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<JDoodleResponseDTO?> ExecuteCodeAsync(string ngonNgu, string code, string input = "")
        {
            string languageId = ngonNgu.ToLower().Trim();
            string versionIndex = "0";

            // Map ngôn ngữ sang chuẩn của JDoodle
            if (languageId == "c#" || languageId == "csharp") { languageId = "csharp"; versionIndex = "4"; }
            else if (languageId == "python") { languageId = "python3"; versionIndex = "4"; }
            else if (languageId == "c++" || languageId == "cpp") { languageId = "cpp"; versionIndex = "5"; }
            else if (languageId == "java") { languageId = "java"; versionIndex = "4"; }

            var requestPayload = new JDoodleRequestDTO
            {
                clientId = _clientId,
                clientSecret = _clientSecret,
                script = code,
                language = languageId,
                versionIndex = versionIndex,
                stdin = input
            };

            try
            {
                // Gọi sang server JDoodle
                var response = await _httpClient.PostAsJsonAsync("https://api.jdoodle.com/v1/execute", requestPayload);

                if (response.IsSuccessStatusCode)
                {
                    return await response.Content.ReadFromJsonAsync<JDoodleResponseDTO>();
                }

                // NẾU LỖI: In ra console để xem JDoodle báo gì (vd: Sai Key, Hết lượt...)
                var errorMsg = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"[Lỗi JDoodle] {response.StatusCode}: {errorMsg}");
                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Lỗi gọi API JDoodle: " + ex.Message);
                return null;
            }
        }
    }
}

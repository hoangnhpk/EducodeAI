using educodeai_server.DTOs.BaiTap;
using System.Text.Json;

namespace educodeai_server.Services.Implementation
{
    public class BaiTapService
    {
        private readonly HttpClient _httpClient;

        public BaiTapService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<JDoodleResponseDTO?> ExecuteCodeAsync(string ngonNgu, string code, string input = "")
        {
            var lang = ngonNgu.ToLower().Trim();

            // Compiler names chính xác từ Wandbox API (https://wandbox.org/api/list.json)
            string compiler;
            if      (lang == "python" || lang == "python3")                     compiler = "cpython-3.12.7";
            else if (lang == "c++" || lang == "cpp")                            compiler = "gcc-13.2.0";
            else if (lang == "c")                                                compiler = "gcc-13.2.0-c";
            else if (lang == "c#" || lang == "csharp")                          compiler = "dotnetcore-8.0.402";
            else if (lang == "java")                                             compiler = "openjdk-jdk-21+35";
            else if (lang == "javascript" || lang == "js" || lang == "nodejs")  compiler = "nodejs-20.17.0";
            else if (lang == "typescript" || lang == "ts")                       compiler = "typescript-5.6.2";
            else if (lang == "go" || lang == "golang")                           compiler = "go-1.23.2";
            else if (lang == "rust")                                             compiler = "rust-1.82.0";
            else if (lang == "ruby")                                             compiler = "ruby-3.2.11";
            else if (lang == "php")                                              compiler = "php-8.3.12";
            else if (lang == "swift")                                            compiler = "swift-6.0.1";
            else if (lang == "scala")                                            compiler = "scala-3.5.1";
            else if (lang == "r")                                                compiler = "r-4.4.1";
            else if (lang == "kotlin")                                           compiler = "groovy-4.0.23"; 
            else                                                                 compiler = "cpython-3.12.7";

            var requestPayload = new
            {
                compiler,
                code,
                stdin = input
            };

            try
            {
                var request = new HttpRequestMessage(HttpMethod.Post, "https://wandbox.org/api/compile.json");
                request.Content = JsonContent.Create(requestPayload);
                request.Headers.Add("Accept", "application/json");

                var response = await _httpClient.SendAsync(request);

                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadFromJsonAsync<JsonElement>();

                    var programOutput = json.TryGetProperty("program_output", out var po) ? po.GetString() ?? "" : "";
                    var programError  = json.TryGetProperty("program_error",  out var pe) ? pe.GetString() ?? "" : "";
                    var compilerError = json.TryGetProperty("compiler_error", out var ce) ? ce.GetString() ?? "" : "";
                    var statusStr     = json.TryGetProperty("status",         out var st) ? st.GetString() ?? "0" : "0";

                    bool hasCompileError = !string.IsNullOrWhiteSpace(compilerError);
                    bool success = statusStr == "0" && !hasCompileError;
                    var output   = !string.IsNullOrWhiteSpace(programOutput) ? programOutput
                                 : !string.IsNullOrWhiteSpace(compilerError) ? compilerError
                                 : programError;

                    return new JDoodleResponseDTO
                    {
                        output     = output.TrimEnd(),
                        statusCode = success ? 200 : 400,
                        error      = !string.IsNullOrWhiteSpace(compilerError) ? compilerError : programError
                    };
                }

                var errorMsg = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"[Lỗi Wandbox] {response.StatusCode}: {errorMsg}");
                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Lỗi gọi Wandbox API: " + ex.Message);
                return null;
            }
        }
    }
}

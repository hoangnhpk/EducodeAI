using educodeai_server.DTOs.BaiTap;
using System.Net;
using System.Text.Json;

namespace educodeai_server.Services.Implementation
{
    public class BaiTapService
    {
        private readonly HttpClient _httpClient;
        private const int MaxAttempts = 3;

        public BaiTapService(HttpClient httpClient)
        {
            _httpClient = httpClient;
            _httpClient.Timeout = TimeSpan.FromSeconds(30);
        }

        public async Task<JDoodleResponseDTO?> ExecuteCodeAsync(string ngonNgu, string code, string input = "")
        {
            var lang = ngonNgu.ToLower().Trim();
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

            var requestPayload = new { compiler, code, stdin = input };
            for (var attempt = 1; attempt <= MaxAttempts; attempt++)
            {
                try
                {
                    using var request = new HttpRequestMessage(HttpMethod.Post, "https://wandbox.org/api/compile.json")
                    {
                        Content = JsonContent.Create(requestPayload)
                    };
                    request.Headers.Add("Accept", "application/json");
                    using var response = await _httpClient.SendAsync(request);
                    var body = await response.Content.ReadAsStringAsync();

                    if (!response.IsSuccessStatusCode)
                    {
                        Console.WriteLine($"[Wandbox] {(int)response.StatusCode}: {body}");
                        if (IsTransient(response.StatusCode) && attempt < MaxAttempts)
                        {
                            await Task.Delay(TimeSpan.FromMilliseconds(300 * attempt));
                            continue;
                        }
                        return InfrastructureError($"Wandbox không sẵn sàng (HTTP {(int)response.StatusCode}).");
                    }

                    using var json = JsonDocument.Parse(body);
                    var root = json.RootElement;
                    var programOutput = Get(root, "program_output");
                    var programError = Get(root, "program_error");
                    var compilerError = Get(root, "compiler_error");
                    var status = Get(root, "status", "0");
                    var runtimeError = !string.IsNullOrWhiteSpace(programError) && IsInfrastructureError(programError);

                    if (runtimeError && attempt < MaxAttempts)
                    {
                        await Task.Delay(TimeSpan.FromMilliseconds(300 * attempt));
                        continue;
                    }

                    var output = !string.IsNullOrWhiteSpace(programOutput) ? programOutput
                               : !string.IsNullOrWhiteSpace(compilerError) ? compilerError : programError;
                    return new JDoodleResponseDTO
                    {
                        output = output.TrimEnd(),
                        statusCode = runtimeError ? 503 : status == "0" && string.IsNullOrWhiteSpace(compilerError) ? 200 : 400,
                        error = runtimeError ? $"[INFRA] {programError}" : !string.IsNullOrWhiteSpace(compilerError) ? compilerError : programError
                    };
                }
                catch (TaskCanceledException) when (attempt < MaxAttempts)
                {
                    await Task.Delay(TimeSpan.FromMilliseconds(300 * attempt));
                }
                catch (HttpRequestException ex) when (attempt < MaxAttempts)
                {
                    Console.WriteLine($"[Wandbox retry {attempt}] {ex.Message}");
                    await Task.Delay(TimeSpan.FromMilliseconds(300 * attempt));
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Lỗi gọi Wandbox API: " + ex.Message);
                    return InfrastructureError("Không thể kết nối máy chủ chấm code.");
                }
            }
            return InfrastructureError("Máy chủ chấm code đang quá tải, vui lòng thử lại.");
        }

        private static string Get(JsonElement root, string name, string fallback = "") =>
            root.TryGetProperty(name, out var value) ? value.GetString() ?? fallback : fallback;

        private static bool IsTransient(HttpStatusCode status) => status == HttpStatusCode.TooManyRequests || (int)status >= 500;

        private static bool IsInfrastructureError(string error) =>
            error.Contains("OCI runtime", StringComparison.OrdinalIgnoreCase) ||
            error.Contains("Resource temporarily unavailable", StringComparison.OrdinalIgnoreCase) ||
            error.Contains("crun:", StringComparison.OrdinalIgnoreCase);

        private static JDoodleResponseDTO InfrastructureError(string message) => new()
        {
            statusCode = 503,
            error = "[INFRA] " + message,
            output = message
        };
    }
}

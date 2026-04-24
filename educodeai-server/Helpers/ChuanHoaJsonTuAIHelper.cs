using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Text.RegularExpressions;

namespace educodeai_server.Helpers
{
    public class ChuanHoaJsonTuAIHelper
    {
        public static string ChuanHoa(string outputAI)
        {
            if (string.IsNullOrWhiteSpace(outputAI))
                throw new Exception("Output AI rỗng");

            // 1. Parse JSON tổng của Gemini
            JObject root;
            try
            {
                root = JObject.Parse(outputAI);
            }
            catch
            {
                throw new Exception("Output không phải JSON hợp lệ (Gemini response)");
            }

            // 2. Lấy text từ candidates -> content -> parts
            var text = root["candidates"]?
                .First?["content"]?["parts"]?
                .Select(p => p?["text"]?.ToString())
                .FirstOrDefault(t => !string.IsNullOrWhiteSpace(t));

            if (string.IsNullOrWhiteSpace(text))
                throw new Exception("Không tìm thấy nội dung text từ Gemini");

            // 3. Tìm JSON nằm trong ```json ... ```
            var match = Regex.Match(
                text,
                @"```json\s*(\{[\s\S]*?\})\s*```",
                RegexOptions.IgnoreCase
            );

            if (!match.Success)
                throw new Exception("Không tìm thấy JSON trong code block ```json");

            string rawJson = match.Groups[1].Value;

            // 4. Parse + format JSON kết quả
            try
            {
                return JToken.Parse(rawJson)
                    .ToString(Formatting.Indented);
            }
            catch (Exception ex)
            {
                throw new Exception("JSON bên trong không hợp lệ", ex);
            }
        }
        public static string usageMetadata(string outputAI)
        {
            if (string.IsNullOrWhiteSpace(outputAI))
                throw new Exception("Output AI rỗng");

            // 1. Parse JSON tổng của Gemini
            JObject root;
            try
            {
                root = JObject.Parse(outputAI);
            }
            catch
            {
                throw new Exception("Output không phải JSON hợp lệ (Gemini response)");
            }

            // 2. Lấy text từ usageMetadata
            var text = root["usageMetadata"];

            if (text == null)
                throw new Exception("Không tìm thấy usageMetadata");

            // 4. Parse + format JSON kết quả
            try
            {
                return text
                    .ToString(Formatting.Indented);
            }
            catch (Exception ex)
            {
                throw new Exception("JSON bên trong không hợp lệ", ex);
            }
        }

        public static string LayTextChatTuAI(string outputAI)
        {
            if (string.IsNullOrWhiteSpace(outputAI))
                throw new Exception("Output AI rỗng");

            // 1. Parse JSON tổng của Gemini
            JObject root;
            try
            {
                root = JObject.Parse(outputAI);
            }
            catch
            {
                throw new Exception("Output không phải JSON hợp lệ (Gemini response)");
            }

            // 2. Lấy text từ candidates -> content -> parts
            var text = root["candidates"]?
                .First?["content"]?["parts"]?
                .Select(p => p?["text"]?.ToString())
                .FirstOrDefault(t => !string.IsNullOrWhiteSpace(t));

            if (string.IsNullOrWhiteSpace(text))
                throw new Exception("Không tìm thấy nội dung text từ Gemini");

            // TRẢ VỀ LUÔN CHUỖI TEXT, KHÔNG TÌM REGEX JSON NỮA
            return text.Trim();
        }
    }
}

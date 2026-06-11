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
                throw new Exception("Output AI r?ng");

            JObject root;
            try
            {
                root = JObject.Parse(outputAI);
            }
            catch
            {
                throw new Exception("Output kh?ng ph?i JSON h?p l? (Gemini response)");
            }

            var parts = root["candidates"]?
                .First?["content"]?["parts"]?
                .OfType<JObject>()
                .ToList();

            if (parts == null || parts.Count == 0)
                throw new Exception("Kh?ng t?m th?y n?i dung text t? Gemini");

            var texts = parts
                .OrderBy(p => p["thought"]?.Value<bool>() == true ? 1 : 0) // ?u ti?n part tr? l?i th?t, b? qua thought n?u c?.
                .Select(p => p["text"]?.ToString())
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .ToList();

            foreach (var text in texts)
            {
                if (TryLayJsonHopLe(text!, out var json))
                {
                    return JToken.Parse(json).ToString(Formatting.Indented);
                }
            }

            throw new Exception("Kh?ng t?m th?y JSON h?p l? trong ph?n h?i AI");
        }

        private static bool TryLayJsonHopLe(string text, out string json)
        {
            json = string.Empty;

            if (string.IsNullOrWhiteSpace(text))
                return false;

            var candidates = new List<string>();

            // 1. H? tr? ```json ... ``` v? ``` ... ```
            foreach (Match match in Regex.Matches(text, @"```(?:json)?\s*([\s\S]*?)\s*```", RegexOptions.IgnoreCase))
            {
                var content = match.Groups[1].Value.Trim();
                if (!string.IsNullOrWhiteSpace(content))
                    candidates.Add(content);
            }

            // 2. H? tr? AI tr? JSON thu?n kh?ng c? code block.
            candidates.Add(text.Trim());

            // 3. H? tr? text c? prose + JSON: b?c c?c object/array c?n b?ng ngo?c.
            candidates.AddRange(TrichXuatJsonCanBang(text));

            foreach (var candidate in candidates)
            {
                var raw = candidate.Trim();
                if (string.IsNullOrWhiteSpace(raw)) continue;

                try
                {
                    JToken.Parse(raw);
                    json = raw;
                    return true;
                }
                catch
                {
                    // Th? candidate ti?p theo.
                }
            }

            return false;
        }

        private static IEnumerable<string> TrichXuatJsonCanBang(string text)
        {
            var results = new List<string>();
            var startIndexes = text
                .Select((ch, index) => new { ch, index })
                .Where(x => x.ch == '{' || x.ch == '[')
                .Select(x => x.index)
                .ToList();

            foreach (var start in startIndexes)
            {
                var open = text[start];
                var close = open == '{' ? '}' : ']';
                var depth = 0;
                var inString = false;
                var escaped = false;

                for (var i = start; i < text.Length; i++)
                {
                    var ch = text[i];

                    if (escaped)
                    {
                        escaped = false;
                        continue;
                    }

                    if (ch == '\\' && inString)
                    {
                        escaped = true;
                        continue;
                    }

                    if (ch == '"')
                    {
                        inString = !inString;
                        continue;
                    }

                    if (inString) continue;

                    if (ch == open) depth++;
                    else if (ch == close) depth--;

                    if (depth == 0)
                    {
                        results.Add(text.Substring(start, i - start + 1));
                        break;
                    }
                }
            }

            // ?u ti?n ?o?n d?i nh?t v? th??ng l? JSON cu?i c?ng/??y ?? nh?t.
            return results.OrderByDescending(x => x.Length);
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

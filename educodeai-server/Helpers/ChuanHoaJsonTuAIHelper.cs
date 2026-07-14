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
                throw new Exception("Output AI rong");

            JObject root;
            try
            {
                root = JObject.Parse(outputAI);
            }
            catch
            {
                throw new Exception("Output khong phai JSON hop le (Gemini response)");
            }

            var parts = root["candidates"]?
                .First?["content"]?["parts"]?
                .OfType<JObject>()
                .ToList();

            if (parts == null || parts.Count == 0)
                throw new Exception("Khong tim thay noi dung text tu Gemini");

            var texts = parts
                .OrderBy(p => p["thought"]?.Value<bool>() == true ? 1 : 0)
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

            throw new Exception("Khong tim thay JSON hop le trong phan hoi AI");
        }

        private static bool TryLayJsonHopLe(string text, out string json)
        {
            json = string.Empty;

            if (string.IsNullOrWhiteSpace(text))
                return false;

            var candidates = new List<string>();

            // 1. Ưu tiên nội dung trong code block ```json ... ```
            foreach (Match match in Regex.Matches(text, @"```(?:json)?\s*([\s\S]*?)\s*```", RegexOptions.IgnoreCase))
            {
                if (match.Groups.Count > 1)
                    candidates.Add(match.Groups[1].Value);
            }

            // 2. Toàn bộ text và các đoạn JSON cân bằng trích xuất được
            candidates.Add(text);
            candidates.AddRange(TrichXuatJsonCanBang(text));

            foreach (var candidate in candidates.Distinct())
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
                    // Thử candidate tiếp theo.
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

            return results.OrderByDescending(x => x.Length);
        }

        public static string usageMetadata(string outputAI)
        {
            if (string.IsNullOrWhiteSpace(outputAI))
                throw new Exception("Output AI rong");

            JObject root;
            try
            {
                root = JObject.Parse(outputAI);
            }
            catch
            {
                throw new Exception("Output khong phai JSON hop le (Gemini response)");
            }

            var text = root["usageMetadata"];
            if (text == null)
                throw new Exception("Khong tim thay usageMetadata");

            try
            {
                return text.ToString(Formatting.Indented);
            }
            catch (Exception ex)
            {
                throw new Exception("JSON ben trong khong hop le", ex);
            }
        }

        public static string LayTextChatTuAI(string outputAI)
        {
            if (string.IsNullOrWhiteSpace(outputAI))
                throw new Exception("Output AI rong");

            JObject root;
            try
            {
                root = JObject.Parse(outputAI);
            }
            catch
            {
                throw new Exception("Output khong phai JSON hop le (Gemini response)");
            }

            var text = root["candidates"]?
                .First?["content"]?["parts"]?
                .Select(p => p?["text"]?.ToString())
                .FirstOrDefault(t => !string.IsNullOrWhiteSpace(t));

            if (string.IsNullOrWhiteSpace(text))
                throw new Exception("Khong tim thay noi dung text tu Gemini");

            return text;
        }

        public static string ExtractJson(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return string.Empty;

            var match = Regex.Match(text, @"```(?:json)?\s*(\{[\s\S]*?\})\s*```", RegexOptions.IgnoreCase);
            if (match.Success)
                return match.Groups[1].Value;

            int startIndex = text.IndexOf('{');
            int endIndex = text.LastIndexOf('}');
            if (startIndex >= 0 && endIndex > startIndex)
                return text.Substring(startIndex, endIndex - startIndex + 1);

            return text;
        }
    }
}

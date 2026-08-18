using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace educodeai_server.Helpers
{
    /// <summary>
    /// Quy đổi dữ liệu câu hỏi quiz về đúng MỘT schema chuẩn:
    /// [{ id, cauHoi, dapAnA, dapAnB, dapAnC, dapAnD, dapAnDung ("A".."D"), giaiThich }]
    ///
    /// Lý do tồn tại: màn preview quiz AI từng lưu thẳng output của Gemini xuống DB, tức schema
    /// [{ Id, NoiDung, LuaChon: [...], DapAnDung }] (đôi khi bọc trong { "Câu hỏi": [...] }).
    /// Schema đó khiến trang làm bài của học viên hiện trống và bị loại khỏi ngân hàng đề chứng chỉ.
    /// </summary>
    public static class ChuanHoaCauHoiQuizHelper
    {
        private static readonly string[] NhanDapAn = { "A", "B", "C", "D" };

        // Giữ nguyên tiếng Việt thay vì escape thành \u00xx cho dễ đọc khi soi DB.
        private static readonly JsonSerializerOptions TuyChonGhi = new()
        {
            Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
        };

        /// <summary>
        /// Có cần quy đổi bản ghi này không. Cố tình bảo thủ: chỉ báo true khi chắc chắn
        /// gặp schema cũ, để không đụng vào dữ liệu đã đúng hoặc dữ liệu lạ.
        /// </summary>
        public static bool CanChuanHoa(string? json)
        {
            if (string.IsNullOrWhiteSpace(json)) return false;

            JsonNode? goc;
            try { goc = JsonNode.Parse(json); }
            catch { return false; }

            if (goc is JsonObject) return LayMangCauHoi(goc) != null;
            if (goc is not JsonArray mang) return false;

            foreach (var phanTu in mang)
            {
                if (phanTu is not JsonObject cau) continue;

                bool coSchemaChuan = !string.IsNullOrWhiteSpace(ChuoiTu(cau["cauHoi"]));
                bool coSchemaCu = cau.ContainsKey("NoiDung") || cau.ContainsKey("LuaChon");

                if (!coSchemaChuan && coSchemaCu) return true;
            }

            return false;
        }

        /// <summary>
        /// Trả về JSON đã chuẩn hoá, hoặc null nếu không đọc được / không có câu hỏi nào.
        /// Null nghĩa là "đừng đụng vào bản ghi này".
        /// </summary>
        public static string? ChuanHoa(string? json)
        {
            if (string.IsNullOrWhiteSpace(json)) return null;

            JsonNode? goc;
            try { goc = JsonNode.Parse(json); }
            catch { return null; }

            var mangCauHoi = LayMangCauHoi(goc);
            if (mangCauHoi == null || mangCauHoi.Count == 0) return null;

            var ketQua = new JsonArray();
            int viTri = 0;

            foreach (var phanTu in mangCauHoi)
            {
                viTri++;
                if (phanTu is not JsonObject cau) return null; // gặp phần tử lạ -> bỏ qua cả bản ghi

                var luaChon = LayLuaChon(cau);

                ketQua.Add(new JsonObject
                {
                    ["id"] = LayId(cau) ?? viTri,
                    ["cauHoi"] = LayChuoi(cau, "cauHoi", "NoiDung"),
                    ["dapAnA"] = luaChon[0],
                    ["dapAnB"] = luaChon[1],
                    ["dapAnC"] = luaChon[2],
                    ["dapAnD"] = luaChon[3],
                    ["dapAnDung"] = ChuanHoaDapAnDung(LayChuoi(cau, "dapAnDung", "DapAnDung")),
                    ["giaiThich"] = LayChuoi(cau, "giaiThich", "GiaiThich")
                });
            }

            return ketQua.ToJsonString(TuyChonGhi);
        }

        /// <summary>Đáp án đúng có thể là chữ cái "A".."D" hoặc chỉ số "0".."3".</summary>
        public static string ChuanHoaDapAnDung(string? giaTri)
        {
            var chuoi = (giaTri ?? string.Empty).Trim().ToUpperInvariant();

            if (Array.IndexOf(NhanDapAn, chuoi) >= 0) return chuoi;
            if (int.TryParse(chuoi, out int chiSo) && chiSo >= 0 && chiSo < NhanDapAn.Length)
                return NhanDapAn[chiSo];

            return "A";
        }

        private static JsonArray? LayMangCauHoi(JsonNode? goc)
        {
            if (goc is JsonArray mang) return mang;
            if (goc is JsonObject obj && obj["Câu hỏi"] is JsonArray mangBoc) return mangBoc;
            return null;
        }

        private static string[] LayLuaChon(JsonObject cau)
        {
            var ketQua = new[] { string.Empty, string.Empty, string.Empty, string.Empty };

            // Schema cũ: mảng LuaChon. Schema chuẩn: 4 trường dapAnA..dapAnD rời.
            var mang = cau["LuaChon"] as JsonArray ?? cau["luaChon"] as JsonArray;
            if (mang != null)
            {
                for (int i = 0; i < ketQua.Length && i < mang.Count; i++)
                {
                    ketQua[i] = ChuoiTu(mang[i]);
                }
                return ketQua;
            }

            ketQua[0] = LayChuoi(cau, "dapAnA", "DapAnA");
            ketQua[1] = LayChuoi(cau, "dapAnB", "DapAnB");
            ketQua[2] = LayChuoi(cau, "dapAnC", "DapAnC");
            ketQua[3] = LayChuoi(cau, "dapAnD", "DapAnD");
            return ketQua;
        }

        private static int? LayId(JsonObject cau)
        {
            var node = cau["id"] ?? cau["Id"];
            if (node == null) return null;
            return int.TryParse(ChuoiTu(node), out int so) ? so : null;
        }

        private static string LayChuoi(JsonObject cau, string khoaChuan, string khoaCu)
        {
            var giaTri = ChuoiTu(cau[khoaChuan]);
            return string.IsNullOrWhiteSpace(giaTri) ? ChuoiTu(cau[khoaCu]) : giaTri;
        }

        private static string ChuoiTu(JsonNode? node) => node?.ToString() ?? string.Empty;
    }
}

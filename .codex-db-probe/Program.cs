using System.Text.Json;
using Npgsql;

var configPath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../educodeai-server/appsettings.Development.json"));
using var configDocument = JsonDocument.Parse(File.ReadAllText(configPath));
var connectionString = configDocument.RootElement
    .GetProperty("ConnectionStrings")
    .GetProperty("DefaultConnection")
    .GetString() ?? throw new InvalidOperationException("Missing database connection string.");

await using var connection = new NpgsqlConnection(connectionString);
await connection.OpenAsync();

var mode = args.FirstOrDefault() ?? "eligible-reviews";
var command = connection.CreateCommand();
command.CommandText = mode switch
{
    "eligible-reviews" => """
        SELECT dk."MaNguoiDung", n."HoTen", dk."MaKhoaHoc", k."TenKhoaHoc",
               dk."TrangThai",
               EXISTS (
                   SELECT 1 FROM "DanhGias" d
                   WHERE d."MaNguoiDung" = dk."MaNguoiDung"
                     AND d."MaKhoaHoc" = dk."MaKhoaHoc"
               ) AS "DaDanhGia"
        FROM "DangKyKhoaHocs" dk
        JOIN "NguoiDungs" n ON n."MaNguoiDung" = dk."MaNguoiDung"
        JOIN "KhoaHocs" k ON k."MaKhoaHoc" = dk."MaKhoaHoc"
        WHERE dk."TrangThai" = 'HoanThanh'
        ORDER BY dk."MaNguoiDung", dk."MaKhoaHoc"
        """,
    "reviews" => """
        SELECT d."MaDanhGia", d."MaNguoiDung", d."MaKhoaHoc", d."SoSao",
               d."NhanXet", d."TrangThai", d."NgayDanhGia"
        FROM "DanhGias" d
        ORDER BY d."MaDanhGia"
        """,
    "submissions" => """
        SELECT k."MaKetQuaBaiNop", k."MaNguoiDung", k."MaBaiTap",
               k."DiemSo", k."TrangThai", k."NgayNop", k."NoiDungNopJSON"
        FROM "KetQuaLamBais" k
        ORDER BY k."MaKetQuaBaiNop" DESC
        LIMIT 10
        """,
    _ => throw new ArgumentException($"Unknown mode: {mode}")
};

await using var reader = await command.ExecuteReaderAsync();
var rows = new List<Dictionary<string, object?>>();
while (await reader.ReadAsync())
{
    var row = new Dictionary<string, object?>();
    for (var index = 0; index < reader.FieldCount; index++)
    {
        row[reader.GetName(index)] = await reader.IsDBNullAsync(index)
            ? null
            : reader.GetValue(index);
    }
    rows.Add(row);
}

Console.WriteLine(JsonSerializer.Serialize(rows, new JsonSerializerOptions { WriteIndented = true }));

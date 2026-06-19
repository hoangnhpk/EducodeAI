using System.Text.Json;
using Npgsql;

var appSettingsPath = Path.GetFullPath(
    Path.Combine(AppContext.BaseDirectory, "../../../../../educodeai-server/appsettings.json"));
using var settings = JsonDocument.Parse(await File.ReadAllTextAsync(appSettingsPath));
var connectionString = settings.RootElement
    .GetProperty("ConnectionStrings")
    .GetProperty("DefaultConnection")
    .GetString() ?? throw new InvalidOperationException("Missing database connection string.");

await using var connection = new NpgsqlConnection(connectionString);
await connection.OpenAsync();

var commandText = args.Length > 0 ? args[0] : "summary";

if (commandText == "summary")
{
    await PrintAsync("""
        select "MaKetQuaBaiNop", "MaNguoiDung", "MaBaiTap", "DiemSo", "TrangThai", "NgayNop",
               "NoiDungNopJSON"
        from "KetQuaLamBais"
        where "MaBaiTap" = 1
        order by "MaKetQuaBaiNop" desc
        limit 5;
        """);

    await PrintAsync("""
        select "MaDanhGia", "MaNguoiDung", "MaKhoaHoc", "SoSao", "NhanXet", "TrangThai", "NgayDanhGia"
        from "DanhGias"
        order by "MaDanhGia" desc
        limit 10;
        """);
}
else if (commandText == "eligibility")
{
    await PrintAsync("""
        select nd."MaNguoiDung", nd."HoTen", kh."MaKhoaHoc", kh."TenKhoaHoc",
               count(distinct bh."MaBaiHoc") as "TongBai",
               count(distinct td."MaBaiHoc") filter (where td."DaXem" = true) as "DaXem",
               exists (
                   select 1 from "DanhGias" dg
                   where dg."MaNguoiDung" = nd."MaNguoiDung"
                     and dg."MaKhoaHoc" = kh."MaKhoaHoc"
               ) as "DaDanhGia"
        from "NguoiDungs" nd
        cross join "KhoaHocs" kh
        join "ChuongHocs" ch on ch."MaKhoaHoc" = kh."MaKhoaHoc"
        join "BaiHocs" bh on bh."MaChuong" = ch."MaChuong"
        left join "TienDoBaiHocs" td
          on td."MaNguoiDung" = nd."MaNguoiDung" and td."MaBaiHoc" = bh."MaBaiHoc"
        where nd."VaiTro" = 2
        group by nd."MaNguoiDung", nd."HoTen", kh."MaKhoaHoc", kh."TenKhoaHoc"
        having count(distinct bh."MaBaiHoc") > 0
           and count(distinct td."MaBaiHoc") filter (where td."DaXem" = true) =
               count(distinct bh."MaBaiHoc")
        order by nd."MaNguoiDung", kh."MaKhoaHoc";
        """);
}

async Task PrintAsync(string sql)
{
    await using var command = new NpgsqlCommand(sql, connection);
    await using var reader = await command.ExecuteReaderAsync();
    var rows = new List<Dictionary<string, object?>>();
    while (await reader.ReadAsync())
    {
        var row = new Dictionary<string, object?>();
        for (var i = 0; i < reader.FieldCount; i++)
            row[reader.GetName(i)] = reader.IsDBNull(i) ? null : reader.GetValue(i);
        rows.Add(row);
    }

    Console.WriteLine(JsonSerializer.Serialize(rows, new JsonSerializerOptions { WriteIndented = true }));
}

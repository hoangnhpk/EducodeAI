using System.Text.Json;
using educodeai_server.Helpers;

namespace educodeai_server.Tests.AI;

public class ChuanHoaCauHoiQuizTests
{
    // Schema cũ do màn preview quiz AI lưu thẳng output Gemini xuống DB.
    private const string SchemaCu = """
        [
          {
            "Id": 1,
            "NoiDung": "Kiểu int trong C++ thường chiếm bao nhiêu byte?",
            "LuaChon": ["2 byte", "4 byte", "8 byte", "1 byte"],
            "DapAnDung": "B",
            "GiaiThich": "Trên đa số hệ thống 32/64-bit, int chiếm 4 byte."
          }
        ]
        """;

    // Schema chuẩn mà trang làm bài của học viên và bộ đề chứng chỉ đang đọc.
    private const string SchemaChuan = """
        [
          {
            "id": 1,
            "cauHoi": "Biến là gì?",
            "dapAnA": "Vùng nhớ có tên",
            "dapAnB": "Một hàm",
            "dapAnC": "Một lớp",
            "dapAnD": "Một file",
            "dapAnDung": "A",
            "giaiThich": "Biến là vùng nhớ được đặt tên."
          }
        ]
        """;

    private static JsonElement CauDauTien(string json)
    {
        using var doc = JsonDocument.Parse(json);
        return doc.RootElement[0].Clone();
    }

    [Fact]
    public void ChuanHoa_DoiSchemaCuSangSchemaChuan()
    {
        var ketQua = ChuanHoaCauHoiQuizHelper.ChuanHoa(SchemaCu);

        Assert.NotNull(ketQua);
        var cau = CauDauTien(ketQua!);

        Assert.Equal("Kiểu int trong C++ thường chiếm bao nhiêu byte?", cau.GetProperty("cauHoi").GetString());
        Assert.Equal("2 byte", cau.GetProperty("dapAnA").GetString());
        Assert.Equal("4 byte", cau.GetProperty("dapAnB").GetString());
        Assert.Equal("8 byte", cau.GetProperty("dapAnC").GetString());
        Assert.Equal("1 byte", cau.GetProperty("dapAnD").GetString());
        Assert.Equal("B", cau.GetProperty("dapAnDung").GetString());
        Assert.Equal("Trên đa số hệ thống 32/64-bit, int chiếm 4 byte.", cau.GetProperty("giaiThich").GetString());
        Assert.Equal(1, cau.GetProperty("id").GetInt32());
    }

    [Fact]
    public void ChuanHoa_GiuNguyenDuLieuDaDungSchema()
    {
        var ketQua = ChuanHoaCauHoiQuizHelper.ChuanHoa(SchemaChuan);

        Assert.NotNull(ketQua);
        var cau = CauDauTien(ketQua!);

        Assert.Equal("Biến là gì?", cau.GetProperty("cauHoi").GetString());
        Assert.Equal("Vùng nhớ có tên", cau.GetProperty("dapAnA").GetString());
        Assert.Equal("A", cau.GetProperty("dapAnDung").GetString());
        Assert.Equal("Biến là vùng nhớ được đặt tên.", cau.GetProperty("giaiThich").GetString());
    }

    [Fact]
    public void ChuanHoa_BocDuocCucJsonCoKhoaCauHoi()
    {
        const string json = """
            {
              "Tiêu đề": "Quiz C++",
              "Độ khó": "Dễ",
              "Câu hỏi": [
                { "Id": 7, "NoiDung": "Câu A?", "LuaChon": ["x", "y", "z", "t"], "DapAnDung": "2" }
              ]
            }
            """;

        var ketQua = ChuanHoaCauHoiQuizHelper.ChuanHoa(json);

        Assert.NotNull(ketQua);
        var cau = CauDauTien(ketQua!);

        Assert.Equal("Câu A?", cau.GetProperty("cauHoi").GetString());
        Assert.Equal(7, cau.GetProperty("id").GetInt32());
        // "2" là chỉ số -> phải quy ra chữ cái "C".
        Assert.Equal("C", cau.GetProperty("dapAnDung").GetString());
    }

    [Fact]
    public void ChuanHoa_ThieuLuaChonThiBuChuoiRong()
    {
        const string json = """
            [ { "NoiDung": "Chỉ có 2 lựa chọn?", "LuaChon": ["a", "b"], "DapAnDung": "A" } ]
            """;

        var cau = CauDauTien(ChuanHoaCauHoiQuizHelper.ChuanHoa(json)!);

        Assert.Equal("a", cau.GetProperty("dapAnA").GetString());
        Assert.Equal("b", cau.GetProperty("dapAnB").GetString());
        Assert.Equal("", cau.GetProperty("dapAnC").GetString());
        Assert.Equal("", cau.GetProperty("dapAnD").GetString());
        // Không có Id -> đánh số theo vị trí.
        Assert.Equal(1, cau.GetProperty("id").GetInt32());
    }

    [Theory]
    [InlineData("A", "A")]
    [InlineData("d", "D")]
    [InlineData(" b ", "B")]
    [InlineData("0", "A")]
    [InlineData("3", "D")]
    [InlineData("9", "A")]      // ngoài khoảng -> mặc định A
    [InlineData("", "A")]
    [InlineData(null, "A")]
    public void ChuanHoaDapAnDung_ChapNhanCaChuCaiVaChiSo(string? dauVao, string mongDoi)
    {
        Assert.Equal(mongDoi, ChuanHoaCauHoiQuizHelper.ChuanHoaDapAnDung(dauVao));
    }

    [Fact]
    public void CanChuanHoa_ChiBaoTrueVoiSchemaCu()
    {
        Assert.True(ChuanHoaCauHoiQuizHelper.CanChuanHoa(SchemaCu));
        Assert.False(ChuanHoaCauHoiQuizHelper.CanChuanHoa(SchemaChuan));
    }

    [Fact]
    public void CanChuanHoa_KhongDungVaoDuLieuHongHoacRong()
    {
        Assert.False(ChuanHoaCauHoiQuizHelper.CanChuanHoa(null));
        Assert.False(ChuanHoaCauHoiQuizHelper.CanChuanHoa(""));
        Assert.False(ChuanHoaCauHoiQuizHelper.CanChuanHoa("khong phai json"));
        Assert.False(ChuanHoaCauHoiQuizHelper.CanChuanHoa("[]"));
    }

    [Fact]
    public void ChuanHoa_TraVeNullKhiKhongDocDuoc()
    {
        Assert.Null(ChuanHoaCauHoiQuizHelper.ChuanHoa("khong phai json"));
        Assert.Null(ChuanHoaCauHoiQuizHelper.ChuanHoa("[]"));
        Assert.Null(ChuanHoaCauHoiQuizHelper.ChuanHoa("[1, 2, 3]"));
    }
}

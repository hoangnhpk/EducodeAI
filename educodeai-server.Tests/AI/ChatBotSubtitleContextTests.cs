using educodeai_server.Services.Implementation;

namespace educodeai_server.Tests.AI;

public class ChatBotSubtitleContextTests
{
    private const string PhuDe = """
        [00:10] Mở đầu bài học
        [01:00] Giải thích kiểu dữ liệu
        [02:00] Giới hạn lưu trữ là khoảng giá trị kiểu dữ liệu có thể chứa
        [02:30] Kiểu int thường chiếm bốn byte
        [04:00] Chuyển sang nội dung tiếp theo
        """;

    [Fact]
    public void LayPhuDeQuanhThoiDiem_ChonDungCacDongTrongKhoang()
    {
        string ketQua = ChatBotAIService.LayPhuDeQuanhThoiDiem(PhuDe, 140, 45);

        Assert.Contains("[02:00]", ketQua);
        Assert.Contains("[02:30]", ketQua);
        Assert.DoesNotContain("[01:00]", ketQua);
        Assert.DoesNotContain("[04:00]", ketQua);
    }

    [Fact]
    public void LayPhuDeQuanhThoiDiem_XuLyDauVideoVaDuLieuRong()
    {
        string ketQua = ChatBotAIService.LayPhuDeQuanhThoiDiem(PhuDe, 5, 10);

        Assert.Contains("[00:10]", ketQua);
        Assert.Equal(string.Empty, ChatBotAIService.LayPhuDeQuanhThoiDiem(string.Empty, 5));
        Assert.Equal(string.Empty, ChatBotAIService.LayPhuDeQuanhThoiDiem(PhuDe, -1));
    }

    [Fact]
    public void LayPhuDeQuanhThoiDiem_HoTroTimestampCoGio()
    {
        const string phuDeDai = "[01:02:03] Nội dung sau hơn một giờ";

        string ketQua = ChatBotAIService.LayPhuDeQuanhThoiDiem(phuDeDai, 3723, 1);

        Assert.Equal(phuDeDai, ketQua);
    }
}

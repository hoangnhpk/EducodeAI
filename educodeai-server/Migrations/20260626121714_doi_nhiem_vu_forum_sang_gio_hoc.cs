using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public partial class doi_nhiem_vu_forum_sang_gio_hoc : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE "MauNhiemVuTuans"
                SET
                    "MaCode" = 'gio_hoc',
                    "TieuDe" = 'Marathon học tập',
                    "MoTa" = 'Tích lũy 12 tiếng học trong tuần',
                    "Icon" = 'clock',
                    "LoaiDem" = 'gio_hoc',
                    "ChiTieu" = 720
                WHERE "MaCode" IN ('forum', 'gio_hoc') OR "MaMau" = 2;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE "MauNhiemVuTuans"
                SET
                    "MaCode" = 'forum',
                    "TieuDe" = 'Tương tác cộng đồng',
                    "MoTa" = 'Gửi 2 bình luận gốc tại bài học',
                    "Icon" = 'chat',
                    "LoaiDem" = 'forum',
                    "ChiTieu" = 2
                WHERE "MaMau" = 2;
                """);
        }
    }
}

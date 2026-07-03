using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public partial class fix_thu_thach_nhiem_vu_mota : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE "MauNhiemVuTuans"
                SET "MoTa" = 'Xem 3 bài học khác nhau trong tuần'
                WHERE "MaCode" = 'hoc_bai';

                UPDATE "MauNhiemVuTuans"
                SET "MoTa" = 'Gửi 2 bình luận gốc tại bài học'
                WHERE "MaCode" = 'forum';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE "MauNhiemVuTuans"
                SET "MoTa" = 'Hoàn thành 3 bài học mới trong tuần'
                WHERE "MaCode" = 'hoc_bai';

                UPDATE "MauNhiemVuTuans"
                SET "MoTa" = 'Đặt 2 câu hỏi trong diễn đàn'
                WHERE "MaCode" = 'forum';
                """);
        }
    }
}

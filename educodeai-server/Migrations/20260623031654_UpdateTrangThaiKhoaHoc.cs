using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTrangThaiKhoaHoc : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE \"KhoaHocs\" SET \"TrangThai\" = 'Hoạt động' WHERE \"DeletedAt\" IS NULL;");
            migrationBuilder.Sql("UPDATE \"KhoaHocs\" SET \"TrangThai\" = 'Đã xóa' WHERE \"DeletedAt\" IS NOT NULL;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}

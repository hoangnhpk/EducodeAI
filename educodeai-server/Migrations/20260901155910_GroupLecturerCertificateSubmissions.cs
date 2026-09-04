using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public partial class GroupLecturerCertificateSubmissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "MaDotGui",
                table: "YeuCauChungChiGiangViens",
                type: "uuid",
                nullable: true);

            // Dữ liệu cũ vốn là từng yêu cầu độc lập, nên mỗi dòng cần một mã đợt riêng.
            // Không dùng Guid.Empty vì như vậy toàn bộ yêu cầu cũ sẽ bị gom nhầm thành một đợt.
            migrationBuilder.Sql(
                "UPDATE \"YeuCauChungChiGiangViens\" " +
                "SET \"MaDotGui\" = md5('lecturer-certificate-' || \"MaYeuCauChungChi\"::text)::uuid " +
                "WHERE \"MaDotGui\" IS NULL;");

            migrationBuilder.AlterColumn<Guid>(
                name: "MaDotGui",
                table: "YeuCauChungChiGiangViens",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_YeuCauChungChiGiangViens_MaDotGui",
                table: "YeuCauChungChiGiangViens",
                column: "MaDotGui");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_YeuCauChungChiGiangViens_MaDotGui",
                table: "YeuCauChungChiGiangViens");

            migrationBuilder.DropColumn(
                name: "MaDotGui",
                table: "YeuCauChungChiGiangViens");
        }
    }
}

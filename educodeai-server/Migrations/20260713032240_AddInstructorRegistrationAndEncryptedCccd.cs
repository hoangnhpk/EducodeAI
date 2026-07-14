using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public partial class AddInstructorRegistrationAndEncryptedCccd : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ??i nullable cho 2 c?t ?nh CCCD (model m?i ?? nullable, code m?i kh?ng l?u ?nh)
            migrationBuilder.AlterColumn<string>(
                name: "AnhGiayToMatTruocUrl",
                table: "HoSoDangKyGiangViens",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "AnhGiayToMatSauUrl",
                table: "HoSoDangKyGiangViens",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            // C?t DuLieuCccdMaHoa ?? t?n t?i tr?n Supabase hi?n t?i ? d?ng IF NOT EXISTS ?? tr?nh l?i
            migrationBuilder.Sql("""
                ALTER TABLE "HoSoDangKyGiangViens"
                ADD COLUMN IF NOT EXISTS "DuLieuCccdMaHoa" text NOT NULL DEFAULT '';
            """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Ch? kh?i ph?c nullable cho 2 c?t ?nh; kh?ng x?a DuLieuCccdMaHoa n?u ?? c?
            migrationBuilder.AlterColumn<string>(
                name: "AnhGiayToMatTruocUrl",
                table: "HoSoDangKyGiangViens",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "AnhGiayToMatSauUrl",
                table: "HoSoDangKyGiangViens",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.Sql("""
                ALTER TABLE "HoSoDangKyGiangViens"
                DROP COLUMN IF EXISTS "DuLieuCccdMaHoa";
            """);
        }
    }
}

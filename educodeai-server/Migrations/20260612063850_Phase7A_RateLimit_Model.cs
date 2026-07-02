using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public partial class Phase7A_RateLimit_Model : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ModelSuDung",
                table: "KeyAPIs",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "RPDLimit",
                table: "KeyAPIs",
                type: "integer",
                nullable: false,
                defaultValue: 1500);

            migrationBuilder.AddColumn<int>(
                name: "RPMLimit",
                table: "KeyAPIs",
                type: "integer",
                nullable: false,
                defaultValue: 15);

            migrationBuilder.AddColumn<int>(
                name: "TPMLimit",
                table: "KeyAPIs",
                type: "integer",
                nullable: false,
                defaultValue: 1000000);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ModelSuDung",
                table: "KeyAPIs");

            migrationBuilder.DropColumn(
                name: "RPDLimit",
                table: "KeyAPIs");

            migrationBuilder.DropColumn(
                name: "RPMLimit",
                table: "KeyAPIs");

            migrationBuilder.DropColumn(
                name: "TPMLimit",
                table: "KeyAPIs");
        }
    }
}

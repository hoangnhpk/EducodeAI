using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public partial class updateDb_ver11 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GoiYAI_TaoBaiTapModels_BaiTap_ThucHanhIDEs_MaBaiTapThucHanh",
                table: "GoiYAI_TaoBaiTapModels");

            migrationBuilder.DropForeignKey(
                name: "FK_LoiGiaiMauModels_BaiTap_ThucHanhIDEs_MaBaiTapThucHanh",
                table: "LoiGiaiMauModels");

            migrationBuilder.DropForeignKey(
                name: "FK_LoiGiaiMauModels_NgonNguLapTrinhs_MaNgonNgu",
                table: "LoiGiaiMauModels");

            migrationBuilder.DropForeignKey(
                name: "FK_PhienBanBaiTapModels_BaiTap_ThucHanhIDEs_MaBaiTapThucHanh",
                table: "PhienBanBaiTapModels");

            migrationBuilder.DropForeignKey(
                name: "FK_RangBuocBaiTapModels_BaiTap_ThucHanhIDEs_MaBaiTapThucHanh",
                table: "RangBuocBaiTapModels");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RangBuocBaiTapModels",
                table: "RangBuocBaiTapModels");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PhienBanBaiTapModels",
                table: "PhienBanBaiTapModels");

            migrationBuilder.DropPrimaryKey(
                name: "PK_LoiGiaiMauModels",
                table: "LoiGiaiMauModels");

            migrationBuilder.DropPrimaryKey(
                name: "PK_GoiYAI_TaoBaiTapModels",
                table: "GoiYAI_TaoBaiTapModels");

            migrationBuilder.RenameTable(
                name: "RangBuocBaiTapModels",
                newName: "RangBuocBaiTaps");

            migrationBuilder.RenameTable(
                name: "PhienBanBaiTapModels",
                newName: "PhienBanBaiTaps");

            migrationBuilder.RenameTable(
                name: "LoiGiaiMauModels",
                newName: "LoiGiaiMaus");

            migrationBuilder.RenameTable(
                name: "GoiYAI_TaoBaiTapModels",
                newName: "GoiYAI_TaoBaiTapS");

            migrationBuilder.RenameIndex(
                name: "IX_RangBuocBaiTapModels_MaBaiTapThucHanh",
                table: "RangBuocBaiTaps",
                newName: "IX_RangBuocBaiTaps_MaBaiTapThucHanh");

            migrationBuilder.RenameIndex(
                name: "IX_PhienBanBaiTapModels_MaBaiTapThucHanh",
                table: "PhienBanBaiTaps",
                newName: "IX_PhienBanBaiTaps_MaBaiTapThucHanh");

            migrationBuilder.RenameIndex(
                name: "IX_LoiGiaiMauModels_MaNgonNgu",
                table: "LoiGiaiMaus",
                newName: "IX_LoiGiaiMaus_MaNgonNgu");

            migrationBuilder.RenameIndex(
                name: "IX_LoiGiaiMauModels_MaBaiTapThucHanh",
                table: "LoiGiaiMaus",
                newName: "IX_LoiGiaiMaus_MaBaiTapThucHanh");

            migrationBuilder.RenameIndex(
                name: "IX_GoiYAI_TaoBaiTapModels_MaBaiTapThucHanh",
                table: "GoiYAI_TaoBaiTapS",
                newName: "IX_GoiYAI_TaoBaiTapS_MaBaiTapThucHanh");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RangBuocBaiTaps",
                table: "RangBuocBaiTaps",
                column: "MaRangBuoc");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PhienBanBaiTaps",
                table: "PhienBanBaiTaps",
                column: "MaPhienBan");

            migrationBuilder.AddPrimaryKey(
                name: "PK_LoiGiaiMaus",
                table: "LoiGiaiMaus",
                column: "MaLoiGiai");

            migrationBuilder.AddPrimaryKey(
                name: "PK_GoiYAI_TaoBaiTapS",
                table: "GoiYAI_TaoBaiTapS",
                column: "MaGoiY");

            migrationBuilder.AddForeignKey(
                name: "FK_GoiYAI_TaoBaiTapS_BaiTap_ThucHanhIDEs_MaBaiTapThucHanh",
                table: "GoiYAI_TaoBaiTapS",
                column: "MaBaiTapThucHanh",
                principalTable: "BaiTap_ThucHanhIDEs",
                principalColumn: "MaBaiTapThucHanh");

            migrationBuilder.AddForeignKey(
                name: "FK_LoiGiaiMaus_BaiTap_ThucHanhIDEs_MaBaiTapThucHanh",
                table: "LoiGiaiMaus",
                column: "MaBaiTapThucHanh",
                principalTable: "BaiTap_ThucHanhIDEs",
                principalColumn: "MaBaiTapThucHanh");

            migrationBuilder.AddForeignKey(
                name: "FK_LoiGiaiMaus_NgonNguLapTrinhs_MaNgonNgu",
                table: "LoiGiaiMaus",
                column: "MaNgonNgu",
                principalTable: "NgonNguLapTrinhs",
                principalColumn: "MaNgonNgu");

            migrationBuilder.AddForeignKey(
                name: "FK_PhienBanBaiTaps_BaiTap_ThucHanhIDEs_MaBaiTapThucHanh",
                table: "PhienBanBaiTaps",
                column: "MaBaiTapThucHanh",
                principalTable: "BaiTap_ThucHanhIDEs",
                principalColumn: "MaBaiTapThucHanh");

            migrationBuilder.AddForeignKey(
                name: "FK_RangBuocBaiTaps_BaiTap_ThucHanhIDEs_MaBaiTapThucHanh",
                table: "RangBuocBaiTaps",
                column: "MaBaiTapThucHanh",
                principalTable: "BaiTap_ThucHanhIDEs",
                principalColumn: "MaBaiTapThucHanh");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GoiYAI_TaoBaiTapS_BaiTap_ThucHanhIDEs_MaBaiTapThucHanh",
                table: "GoiYAI_TaoBaiTapS");

            migrationBuilder.DropForeignKey(
                name: "FK_LoiGiaiMaus_BaiTap_ThucHanhIDEs_MaBaiTapThucHanh",
                table: "LoiGiaiMaus");

            migrationBuilder.DropForeignKey(
                name: "FK_LoiGiaiMaus_NgonNguLapTrinhs_MaNgonNgu",
                table: "LoiGiaiMaus");

            migrationBuilder.DropForeignKey(
                name: "FK_PhienBanBaiTaps_BaiTap_ThucHanhIDEs_MaBaiTapThucHanh",
                table: "PhienBanBaiTaps");

            migrationBuilder.DropForeignKey(
                name: "FK_RangBuocBaiTaps_BaiTap_ThucHanhIDEs_MaBaiTapThucHanh",
                table: "RangBuocBaiTaps");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RangBuocBaiTaps",
                table: "RangBuocBaiTaps");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PhienBanBaiTaps",
                table: "PhienBanBaiTaps");

            migrationBuilder.DropPrimaryKey(
                name: "PK_LoiGiaiMaus",
                table: "LoiGiaiMaus");

            migrationBuilder.DropPrimaryKey(
                name: "PK_GoiYAI_TaoBaiTapS",
                table: "GoiYAI_TaoBaiTapS");

            migrationBuilder.RenameTable(
                name: "RangBuocBaiTaps",
                newName: "RangBuocBaiTapModels");

            migrationBuilder.RenameTable(
                name: "PhienBanBaiTaps",
                newName: "PhienBanBaiTapModels");

            migrationBuilder.RenameTable(
                name: "LoiGiaiMaus",
                newName: "LoiGiaiMauModels");

            migrationBuilder.RenameTable(
                name: "GoiYAI_TaoBaiTapS",
                newName: "GoiYAI_TaoBaiTapModels");

            migrationBuilder.RenameIndex(
                name: "IX_RangBuocBaiTaps_MaBaiTapThucHanh",
                table: "RangBuocBaiTapModels",
                newName: "IX_RangBuocBaiTapModels_MaBaiTapThucHanh");

            migrationBuilder.RenameIndex(
                name: "IX_PhienBanBaiTaps_MaBaiTapThucHanh",
                table: "PhienBanBaiTapModels",
                newName: "IX_PhienBanBaiTapModels_MaBaiTapThucHanh");

            migrationBuilder.RenameIndex(
                name: "IX_LoiGiaiMaus_MaNgonNgu",
                table: "LoiGiaiMauModels",
                newName: "IX_LoiGiaiMauModels_MaNgonNgu");

            migrationBuilder.RenameIndex(
                name: "IX_LoiGiaiMaus_MaBaiTapThucHanh",
                table: "LoiGiaiMauModels",
                newName: "IX_LoiGiaiMauModels_MaBaiTapThucHanh");

            migrationBuilder.RenameIndex(
                name: "IX_GoiYAI_TaoBaiTapS_MaBaiTapThucHanh",
                table: "GoiYAI_TaoBaiTapModels",
                newName: "IX_GoiYAI_TaoBaiTapModels_MaBaiTapThucHanh");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RangBuocBaiTapModels",
                table: "RangBuocBaiTapModels",
                column: "MaRangBuoc");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PhienBanBaiTapModels",
                table: "PhienBanBaiTapModels",
                column: "MaPhienBan");

            migrationBuilder.AddPrimaryKey(
                name: "PK_LoiGiaiMauModels",
                table: "LoiGiaiMauModels",
                column: "MaLoiGiai");

            migrationBuilder.AddPrimaryKey(
                name: "PK_GoiYAI_TaoBaiTapModels",
                table: "GoiYAI_TaoBaiTapModels",
                column: "MaGoiY");

            migrationBuilder.AddForeignKey(
                name: "FK_GoiYAI_TaoBaiTapModels_BaiTap_ThucHanhIDEs_MaBaiTapThucHanh",
                table: "GoiYAI_TaoBaiTapModels",
                column: "MaBaiTapThucHanh",
                principalTable: "BaiTap_ThucHanhIDEs",
                principalColumn: "MaBaiTapThucHanh");

            migrationBuilder.AddForeignKey(
                name: "FK_LoiGiaiMauModels_BaiTap_ThucHanhIDEs_MaBaiTapThucHanh",
                table: "LoiGiaiMauModels",
                column: "MaBaiTapThucHanh",
                principalTable: "BaiTap_ThucHanhIDEs",
                principalColumn: "MaBaiTapThucHanh");

            migrationBuilder.AddForeignKey(
                name: "FK_LoiGiaiMauModels_NgonNguLapTrinhs_MaNgonNgu",
                table: "LoiGiaiMauModels",
                column: "MaNgonNgu",
                principalTable: "NgonNguLapTrinhs",
                principalColumn: "MaNgonNgu");

            migrationBuilder.AddForeignKey(
                name: "FK_PhienBanBaiTapModels_BaiTap_ThucHanhIDEs_MaBaiTapThucHanh",
                table: "PhienBanBaiTapModels",
                column: "MaBaiTapThucHanh",
                principalTable: "BaiTap_ThucHanhIDEs",
                principalColumn: "MaBaiTapThucHanh");

            migrationBuilder.AddForeignKey(
                name: "FK_RangBuocBaiTapModels_BaiTap_ThucHanhIDEs_MaBaiTapThucHanh",
                table: "RangBuocBaiTapModels",
                column: "MaBaiTapThucHanh",
                principalTable: "BaiTap_ThucHanhIDEs",
                principalColumn: "MaBaiTapThucHanh");
        }
    }
}

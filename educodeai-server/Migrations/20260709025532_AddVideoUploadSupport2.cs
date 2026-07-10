using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    // CỐ Ý RỖNG: các cột video/phụ đề của BaiHocs (VideoPublicId, VideoSource, HasSubtitle,
    // SubtitleUrl, AiFeaturesEnabled, ...) đã được định nghĩa sẵn trong migration InitialCreate
    // (20250702142529). Vì vậy không có delta schema nào cần áp ở đây.
    // Với các DB đã áp InitialCreate bản cũ (chưa có cột video), việc vá được xử lý idempotent
    // lúc startup qua Helpers/DatabaseSchemaSync.ApplyAsync() (ADD COLUMN IF NOT EXISTS).
    public partial class AddVideoUploadSupport2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}

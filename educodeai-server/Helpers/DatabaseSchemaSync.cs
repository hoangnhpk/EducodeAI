using educodeai_server.Data;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Helpers;

/// <summary>
/// Bổ sung cột thiếu khi DB Supabase lệch so với EF model (migration đã ghi nhưng schema chưa đủ).
/// </summary>
public static class DatabaseSchemaSync
{
    public static async Task ApplyAsync(EduCodeAIDbContext context, CancellationToken cancellationToken = default)
    {
        await context.Database.ExecuteSqlRawAsync(
            """
            ALTER TABLE "KhoaHocs" ADD COLUMN IF NOT EXISTS "DeletedAt" timestamp with time zone NULL;
            ALTER TABLE "KhoaHocs" ADD COLUMN IF NOT EXISTS "DeletedBy" integer NULL;
            ALTER TABLE "KhoaHocs" ADD COLUMN IF NOT EXISTS "DonViTienTe" character varying(10) NOT NULL DEFAULT 'VND';
            ALTER TABLE "KhoaHocs" ADD COLUMN IF NOT EXISTS "ChoPhepMua" boolean NOT NULL DEFAULT true;

            ALTER TABLE "KeyAPIs" ADD COLUMN IF NOT EXISTS "DeletedAt" timestamp with time zone NULL;
            ALTER TABLE "KeyAPIs" ADD COLUMN IF NOT EXISTS "DeletedBy" integer NULL;

            ALTER TABLE "BaiHocs" ADD COLUMN IF NOT EXISTS "CoQuiz" boolean NOT NULL DEFAULT true;
            ALTER TABLE "BaiHocs" ADD COLUMN IF NOT EXISTS "VideoPublicId" character varying(255) NULL;
            ALTER TABLE "BaiHocs" ADD COLUMN IF NOT EXISTS "VideoSource" character varying(20) NOT NULL DEFAULT 'youtube';
            ALTER TABLE "BaiHocs" ADD COLUMN IF NOT EXISTS "VideoStatus" character varying(30) NULL;
            ALTER TABLE "BaiHocs" ADD COLUMN IF NOT EXISTS "VideoDurationS" integer NULL;
            ALTER TABLE "BaiHocs" ADD COLUMN IF NOT EXISTS "VideoSizeMb" integer NULL;
            ALTER TABLE "BaiHocs" ADD COLUMN IF NOT EXISTS "HasSubtitle" boolean NOT NULL DEFAULT false;
            ALTER TABLE "BaiHocs" ADD COLUMN IF NOT EXISTS "SubtitleUrl" text NULL;
            ALTER TABLE "BaiHocs" ADD COLUMN IF NOT EXISTS "SubtitleSource" character varying(20) NULL;
            ALTER TABLE "BaiHocs" ADD COLUMN IF NOT EXISTS "AiFeaturesEnabled" boolean NOT NULL DEFAULT true;
            """,
            cancellationToken);
    }
}

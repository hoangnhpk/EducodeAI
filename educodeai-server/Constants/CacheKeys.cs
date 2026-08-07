namespace educodeai_server.Constants
{
    /// <summary>
    /// Tập trung mọi Redis cache key. Tránh literal rải rác gây lệch key giữa nơi ghi và nơi xóa.
    /// </summary>
    public static class CacheKeys
    {
        // ===== Khóa học =====
        // Course list công khai (học viên đọc)
        public const string CourseListPublic = "CourseList:Public:v2";

        // Course list theo giảng viên
        public static string InstructorCourseList(int maGiangVien) => $"Instructor:{maGiangVien}:CourseList";

        // Version key cho chi tiết khóa học (invalidate bằng cách tăng version)
        public static string CourseVersion(int maKhoaHoc) => $"course:{maKhoaHoc}:version";

        // ===== API Key pool & log queue =====
        public static string KeyPool(int id) => $"EduCodeAI:KeyPool:{id}";
        public const string KeyPoolPattern = "EduCodeAI:KeyPool:*";
        public const string LogQueue = "EduCodeAI:LogQueue";

        // ===== API Key usage counters (RateLimitService ghi, dashboard/reset đọc) =====
        public static string UsageRpm(int keyId, string yyyyMMddHHmm) => $"EduCodeAI:Usage:RPM:{keyId}:{yyyyMMddHHmm}";
        public static string UsageTpm(int keyId, string yyyyMMddHHmm) => $"EduCodeAI:Usage:TPM:{keyId}:{yyyyMMddHHmm}";
        public static string UsageRpd(int keyId, string yyyyMMdd) => $"EduCodeAI:Usage:RPD:{keyId}:{yyyyMMdd}";
        public static string UsageDailyToken(int keyId, string yyyyMMdd) => $"EduCodeAI:Usage:DailyToken:{keyId}:{yyyyMMdd}";

        // ===== System config =====
        public const string SystemConfigAll = "SystemConfig:All";
    }
}

namespace educodeai_server.Config
{
    public class CauHinhCloudinary
    {
        public required string CloudName { get; set; }
        public required string ApiKey { get; set; }
        public required string ApiSecret { get; set; }
        public required string UploadPreset { get; set; }

        // Dọn video "rác" (đã upload lên Cloudinary nhưng không có BaiHoc nào trỏ tới,
        // do rớt mạng lúc lưu DB). Mặc định BẬT nhưng chạy DRY-RUN (chỉ log, không xóa)
        // để vận hành kiểm chứng trước; đặt OrphanCleanupDryRun=false khi đã tin tưởng.
        public bool OrphanCleanupEnabled { get; set; } = true;
        public bool OrphanCleanupDryRun { get; set; } = true;
    }
}

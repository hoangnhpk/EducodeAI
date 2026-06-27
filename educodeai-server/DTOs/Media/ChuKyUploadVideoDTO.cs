namespace educodeai_server.DTOs.Media
{
    public class ChuKyUploadVideoDTO
    {
        public required string Timestamp { get; set; }
        public required string Signature { get; set; }
        public required string ApiKey { get; set; }
        public required string CloudName { get; set; }
        public required string Folder { get; set; }
    }
}

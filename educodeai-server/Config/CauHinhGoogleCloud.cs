namespace educodeai_server.Config
{
    public class CauHinhGoogleCloud
    {
        public required string ProjectId { get; set; }
        public required string ServiceAccountJsonPath { get; set; }
        public string? AudioStagingBucket { get; set; }
        public CauHinhSpeechToText SpeechToText { get; set; } = new();
    }

    public class CauHinhSpeechToText
    {
        public string Language { get; set; } = "vi-VN";
        public string Model { get; set; } = "default";
        public double PricePerMinuteUsd { get; set; } = 0.024;
    }
}

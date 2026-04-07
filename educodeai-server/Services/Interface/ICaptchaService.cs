namespace educodeai_server.Services.Interface
{
    public interface ICaptchaService
    {
        Task<bool> XacNhanCaptchaAsync(string captchaToken);
    }
}
using educodeai_server.DTOs.Common;

namespace educodeai_server.Helpers;

public sealed class GlobalExceptionMiddleware
{
    private const string GenericMessage = "Hệ thống không thể xử lý yêu cầu. Vui lòng thử lại sau.";
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ApiException exception)
        {
            _logger.LogWarning(
                "Request rejected with {ErrorCode} for {Method} {Path}. TraceId: {TraceId}",
                exception.ErrorCode,
                context.Request.Method,
                context.Request.Path,
                context.TraceIdentifier);

            await WriteErrorResponseAsync(
                context,
                exception.StatusCode,
                exception.ErrorCode,
                exception.SafeMessage);
        }
        catch (Exception exception)
        {
            // Message có thể chứa connection string/secret (Supabase/DNS/socket) nên redact
            // trước khi ghi log; giữ type + stack trace để chẩn đoán.
            _logger.LogError(
                "Unhandled request failure for {Method} {Path}. TraceId: {TraceId}. Type: {ExceptionType}. Detail: {Detail}. Stack: {Stack}",
                context.Request.Method,
                context.Request.Path,
                context.TraceIdentifier,
                exception.GetType().FullName,
                SensitiveDataRedactor.Redact(exception.Message),
                exception.StackTrace);

            await WriteErrorResponseAsync(
                context,
                StatusCodes.Status500InternalServerError,
                ApiErrorCodes.InternalError,
                GenericMessage);
        }
    }

    private static async Task WriteErrorResponseAsync(
        HttpContext context,
        int statusCode,
        string errorCode,
        string safeMessage)
    {
        if (context.Response.HasStarted)
        {
            return;
        }

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        // Envelope chuẩn { success, error:{ code, message } } kèm message top-level
        // để tương thích frontend đang đọc error.response.data.message.
        var payload = new
        {
            success = false,
            message = safeMessage,
            error = new { code = errorCode, message = safeMessage }
        };
        await context.Response.WriteAsJsonAsync(payload);
    }
}

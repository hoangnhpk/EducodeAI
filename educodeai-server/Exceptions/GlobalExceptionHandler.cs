using System.Text.Json;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Exceptions;

public sealed class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var statusCode = exception switch
        {
            ApiException apiException => apiException.StatusCode,
            ArgumentException => StatusCodes.Status400BadRequest,
            UnauthorizedAccessException => StatusCodes.Status403Forbidden,
            KeyNotFoundException => StatusCodes.Status404NotFound,
            DbUpdateException => StatusCodes.Status409Conflict,
            _ => StatusCodes.Status500InternalServerError
        };

        if (statusCode >= 500)
        {
            _logger.LogError(exception, "Unhandled exception for {Method} {Path}. TraceId={TraceId}",
                httpContext.Request.Method,
                httpContext.Request.Path,
                httpContext.TraceIdentifier);
        }
        else
        {
            _logger.LogWarning("Request failed with {StatusCode} for {Method} {Path}. Message={Message}. TraceId={TraceId}",
                statusCode,
                httpContext.Request.Method,
                httpContext.Request.Path,
                exception.Message,
                httpContext.TraceIdentifier);
        }

        if (httpContext.Response.HasStarted)
        {
            _logger.LogWarning("Cannot write error response because the response has already started. TraceId={TraceId}",
                httpContext.TraceIdentifier);
            return false;
        }

        httpContext.Response.StatusCode = statusCode;
        httpContext.Response.ContentType = "application/json";

        var message = statusCode >= 500
            ? "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau."
            : exception.Message;

        await httpContext.Response.WriteAsync(JsonSerializer.Serialize(new
        {
            success = false,
            message,
            traceId = httpContext.TraceIdentifier
        }), cancellationToken);

        return true;
    }
}

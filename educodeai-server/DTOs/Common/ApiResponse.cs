namespace educodeai_server.DTOs.Common;

public sealed record ApiError(string Code, string Message);

public sealed record ApiResponse<T>(bool Success, T? Data, ApiError? Error)
{
    public static ApiResponse<T> Ok(T data) => new(true, data, null);

    public static ApiResponse<T> Fail(string code, string message) =>
        new(false, default, new ApiError(code, message));
}

public static class ApiErrorCodes
{
    public const string InternalError = "INTERNAL_ERROR";
    public const string InvalidRequest = "INVALID_REQUEST";
    public const string AuthenticationFailed = "AUTHENTICATION_FAILED";
    public const string AuthStateUnavailable = "AUTH_STATE_UNAVAILABLE";
}

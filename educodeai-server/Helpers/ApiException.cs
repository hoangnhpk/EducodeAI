namespace educodeai_server.Helpers;

public sealed class ApiException : Exception
{
    public ApiException(int statusCode, string errorCode, string safeMessage)
        : base(safeMessage)
    {
        StatusCode = statusCode;
        ErrorCode = errorCode;
        SafeMessage = safeMessage;
    }

    public int StatusCode { get; }
    public string ErrorCode { get; }
    public string SafeMessage { get; }

    public static ApiException InvalidRequest(
        string safeMessage = "Dữ liệu yêu cầu không hợp lệ.") =>
        new(StatusCodes.Status400BadRequest, "INVALID_REQUEST", safeMessage);

    public static ApiException AuthenticationFailed(
        string safeMessage = "Thông tin xác thực không hợp lệ.") =>
        new(StatusCodes.Status401Unauthorized, "AUTHENTICATION_FAILED", safeMessage);

    public static ApiException Forbidden(
        string safeMessage = "Bạn không có quyền thực hiện thao tác này.") =>
        new(StatusCodes.Status403Forbidden, "FORBIDDEN", safeMessage);

    public static ApiException Conflict(
        string safeMessage = "Dữ liệu vừa được thay đổi. Vui lòng tải lại và thử lại.") =>
        new(StatusCodes.Status409Conflict, "CONFLICT", safeMessage);
}

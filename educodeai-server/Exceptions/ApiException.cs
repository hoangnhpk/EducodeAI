namespace educodeai_server.Exceptions;

public class ApiException : Exception
{
    public int StatusCode { get; }

    public ApiException(int statusCode, string message) : base(message)
    {
        StatusCode = statusCode;
    }
}

public sealed class NotFoundException : ApiException
{
    public NotFoundException(string message) : base(StatusCodes.Status404NotFound, message) { }
}

public sealed class ForbiddenException : ApiException
{
    public ForbiddenException(string message) : base(StatusCodes.Status403Forbidden, message) { }
}

public sealed class ConflictException : ApiException
{
    public ConflictException(string message) : base(StatusCodes.Status409Conflict, message) { }
}

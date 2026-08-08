using educodeai_server.Services.IdentityDocuments;

namespace educodeai_server.Tests.IdentityDocuments;

public sealed class CccdQrParserTests
{
    [Fact]
    public void Parse_WithValidSchema_ReturnsValidatedFields()
    {
        var result = CccdQrParser.Parse(
            "012345678901|123456789|NGUYEN VAN A|29022000|Nam|Ha Noi|01012024");

        Assert.True(result.IsValid);
        Assert.Equal("012345678901", result.DocumentNumber);
        Assert.Equal("29/02/2000", result.DateOfBirth);
        Assert.Equal("01/01/2024", result.IssueDate);
    }

    [Theory]
    [InlineData("1234567890123|123456789|NGUYEN VAN A|01012000|Nam|Ha Noi|01012024")]
    [InlineData("012345678901|123456789|NGUYEN VAN A|31022000|Nam|Ha Noi|01012024")]
    [InlineData("012345678901|123456789|NGUYEN VAN A|01012000|Nam|Ha Noi|31022024")]
    [InlineData("012345678901|too-short")]
    public void Parse_WithInvalidSchema_RejectsPayload(string payload)
    {
        var result = CccdQrParser.Parse(payload);

        Assert.False(result.IsValid);
        Assert.Null(result.DocumentNumber);
    }
}

using educodeai_server.Services.IdentityDocuments;

namespace educodeai_server.Tests.IdentityDocuments;

public sealed class IdentityDocumentRulesTests
{
    [Theory]
    [InlineData("012345678901", "012345678901", true)]
    [InlineData("012345678901", "012345678902", false)]
    [InlineData("012345678901", "012345678910", false)]
    [InlineData("01234567890O", "012345678900", false)]
    public void AreIdentifiersExactlyEqual_ForCccd_RequiresExactSafeCanonicalValue(
        string first,
        string second,
        bool expected)
    {
        var actual = IdentityDocumentRules.AreIdentifiersExactlyEqual(first, second, "CCCD");

        Assert.Equal(expected, actual);
    }

    [Theory]
    [InlineData(" B1234567 ", "b1234567", true)]
    [InlineData("B1234567", "81234567", false)]
    public void AreIdentifiersExactlyEqual_ForPassport_PreservesLetters(
        string first,
        string second,
        bool expected)
    {
        var actual = IdentityDocumentRules.AreIdentifiersExactlyEqual(first, second, "Passport");

        Assert.Equal(expected, actual);
    }

    [Theory]
    [InlineData("29022024", "29/02/2024")]
    [InlineData("31022024", null)]
    [InlineData("00012024", null)]
    public void NormalizeCompactDate_ValidatesTheCalendar(string raw, string? expected)
    {
        Assert.Equal(expected, IdentityDocumentRules.NormalizeCompactDate(raw));
    }
}

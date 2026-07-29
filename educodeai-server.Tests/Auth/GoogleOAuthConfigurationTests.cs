using System.Text.RegularExpressions;

namespace educodeai_server.Tests.Auth;

public sealed class GoogleOAuthConfigurationTests
{
    [Fact]
    public void Program_DoesNotReloadBaseSettingsAfterEnvironmentSettings()
    {
        var programPath = Path.GetFullPath(
            Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "educodeai-server", "Program.cs"));
        var source = File.ReadAllText(programPath);

        Assert.DoesNotMatch(
            new Regex("builder\\.Configuration\\s*\\.AddJsonFile\\(\"appsettings\\.json\"", RegexOptions.CultureInvariant),
            source);
    }
}

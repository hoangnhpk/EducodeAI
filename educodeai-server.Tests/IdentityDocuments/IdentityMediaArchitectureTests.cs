namespace educodeai_server.Tests.IdentityDocuments;

public sealed class IdentityMediaArchitectureTests
{
    private static readonly string ServerRoot = FindServerRoot();

    [Fact]
    public void ActiveIdentityFlows_DoNotCallLegacyPrivateDocumentWriter()
    {
        var source = ReadAuthenticationService();
        var legacyWriter = source.IndexOf("private static async Task<string> LuuFilePrivateAsync", StringComparison.Ordinal);
        Assert.True(legacyWriter >= 0, "Expected the isolated legacy writer declaration to remain discoverable.");

        Assert.Equal(1, CountOccurrences(source, "LuuFilePrivateAsync("));
    }

    [Fact]
    public void IdentityDocumentHelpers_DoNotPersistUploadedDocuments()
    {
        var identityDirectory = Path.Combine(ServerRoot, "Services", "IdentityDocuments");
        var prohibited = new[] { "FileStream", "WriteAllBytes", "FileMode.Create" };

        foreach (var file in Directory.EnumerateFiles(identityDirectory, "*.cs"))
        {
            if (Path.GetFileName(file).Equals("AvatarStorageCleanup.cs", StringComparison.OrdinalIgnoreCase))
                continue;
            var source = File.ReadAllText(file);
            Assert.All(prohibited, token => Assert.DoesNotContain(token, source, StringComparison.Ordinal));
        }
    }

    [Fact]
    public void AuthenticationService_UsesConstrainedAvatarCleanupInsteadOfDirectDelete()
    {
        var source = ReadAuthenticationService();

        Assert.Contains("AvatarStorageCleanup.TryDeleteIfInsideRoot", source, StringComparison.Ordinal);
    }

    private static int CountOccurrences(string source, string value)
    {
        var count = 0;
        var offset = 0;
        while ((offset = source.IndexOf(value, offset, StringComparison.Ordinal)) >= 0)
        {
            count++;
            offset += value.Length;
        }
        return count;
    }

    private static string ReadAuthenticationService() =>
        File.ReadAllText(Path.Combine(ServerRoot, "Services", "Implementation", "XacThucService.cs"));

    private static string FindServerRoot()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null)
        {
            var candidate = Path.Combine(directory.FullName, "educodeai-server");
            if (Directory.Exists(candidate)) return candidate;
            directory = directory.Parent;
        }
        throw new DirectoryNotFoundException("Could not locate educodeai-server source root.");
    }
}

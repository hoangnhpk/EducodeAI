using educodeai_server.Services.IdentityDocuments;

namespace educodeai_server.Tests.IdentityDocuments;

public sealed class LegacyMediaManifestClassifierTests
{
    [Fact]
    public void Classify_SyntheticCandidates_CoversEveryManifestCategoryWithoutMutatingFiles()
    {
        var root = Path.Combine(Path.GetTempPath(), "educodeai-manifest-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(root);
        var sentinel = Path.Combine(root, "runtime", "sentinel.bin");
        Directory.CreateDirectory(Path.GetDirectoryName(sentinel)!);
        File.WriteAllText(sentinel, "unchanged");
        try
        {
            var candidates = new[]
            {
                new LegacyMediaCandidate("fixture-1", "tests/fixtures/photo.png", true, false),
                new LegacyMediaCandidate("runtime-1", "runtime/cache/photo.png", true, false),
                new LegacyMediaCandidate("runtime-2", "runtime/sentinel.bin", false, false),
                new LegacyMediaCandidate("avatar-1", "wwwroot/uploads/avatars/a.png", true, true),
                new LegacyMediaCandidate("avatar-2", "wwwroot/uploads/avatars/b.png", false, false),
                new LegacyMediaCandidate("document-1", "wwwroot/uploads/dang-ky-giang-vien/giay-to/c.png", true, false)
            };

            var entries = LegacyMediaManifestClassifier.Classify(root, candidates);

            Assert.Equal(Enum.GetValues<LegacyMediaClassification>().Order(), entries.Select(x => x.Classification).Order());
            Assert.All(entries, entry => Assert.DoesNotContain(root.Replace('\\', '/'), entry.NormalizedRelativePath));
            Assert.Equal("unchanged", File.ReadAllText(sentinel));
        }
        finally
        {
            Directory.Delete(root, recursive: true);
        }
    }

    [Theory]
    [InlineData("../outside.png")]
    [InlineData("../../secret/identity.png")]
    public void Classify_PathOutsideRoot_IsRejected(string path)
    {
        var root = Path.Combine(Path.GetTempPath(), "educodeai-manifest-root");
        var candidate = new LegacyMediaCandidate("safe-id", path, false, false);

        Assert.Throws<ArgumentException>(() => LegacyMediaManifestClassifier.Classify(root, [candidate]));
    }

    [Theory]
    [InlineData("person@example.com")]
    [InlineData("Nguyen Van A")]
    public void Classify_PotentialPiiTechnicalId_IsRejected(string technicalId)
    {
        var candidate = new LegacyMediaCandidate(technicalId, "runtime/a.png", false, false);

        Assert.Throws<ArgumentException>(() => LegacyMediaManifestClassifier.Classify(Path.GetTempPath(), [candidate]));
    }
}

namespace educodeai_server.Services.IdentityDocuments;

public enum LegacyMediaClassification
{
    TrackedFixture,
    TrackedRuntime,
    UntrackedRuntime,
    DatabaseReferencedAvatar,
    OrphanAvatar,
    SuspectedIdentityDocument
}

public sealed record LegacyMediaCandidate(
    string TechnicalId,
    string RelativePath,
    bool IsTracked,
    bool IsDatabaseReferenced);

public sealed record LegacyMediaManifestEntry(
    string TechnicalId,
    string NormalizedRelativePath,
    LegacyMediaClassification Classification);

public static class LegacyMediaManifestClassifier
{
    public static IReadOnlyList<LegacyMediaManifestEntry> Classify(
        string repositoryRoot,
        IEnumerable<LegacyMediaCandidate> candidates)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(repositoryRoot);
        ArgumentNullException.ThrowIfNull(candidates);
        var root = Path.GetFullPath(repositoryRoot)
            .TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar) + Path.DirectorySeparatorChar;

        return candidates.Select(candidate => ClassifyOne(root, candidate)).ToArray();
    }

    private static LegacyMediaManifestEntry ClassifyOne(string root, LegacyMediaCandidate candidate)
    {
        if (string.IsNullOrWhiteSpace(candidate.TechnicalId) ||
            candidate.TechnicalId.Any(character => !char.IsLetterOrDigit(character) && character is not '-' and not '_'))
        {
            throw new ArgumentException("Technical IDs must be non-PII identifiers.", nameof(candidate));
        }

        var fullPath = Path.GetFullPath(Path.Combine(root, candidate.RelativePath));
        if (!fullPath.StartsWith(root, StringComparison.OrdinalIgnoreCase))
        {
            throw new ArgumentException("Candidate path escapes the repository root.", nameof(candidate));
        }

        var relativePath = Path.GetRelativePath(root, fullPath).Replace('\\', '/');
        var classification = ClassifyPath(relativePath, candidate);
        return new(candidate.TechnicalId, relativePath, classification);
    }

    private static LegacyMediaClassification ClassifyPath(string path, LegacyMediaCandidate candidate)
    {
        if (path.Contains("/giay-to/", StringComparison.OrdinalIgnoreCase) ||
            path.Contains("/identity", StringComparison.OrdinalIgnoreCase))
            return LegacyMediaClassification.SuspectedIdentityDocument;

        var isAvatar = path.Contains("/avatar", StringComparison.OrdinalIgnoreCase);
        if (isAvatar && candidate.IsDatabaseReferenced)
            return LegacyMediaClassification.DatabaseReferencedAvatar;
        if (isAvatar)
            return LegacyMediaClassification.OrphanAvatar;
        if (path.Contains("fixture", StringComparison.OrdinalIgnoreCase))
            return LegacyMediaClassification.TrackedFixture;
        return candidate.IsTracked
            ? LegacyMediaClassification.TrackedRuntime
            : LegacyMediaClassification.UntrackedRuntime;
    }
}

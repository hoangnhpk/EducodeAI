namespace educodeai_server.Services.IdentityDocuments;

public static class AvatarStorageCleanup
{
    public static bool TryDeleteIfInsideRoot(string rootDirectory, string candidatePath, ILogger logger)
    {
        try
        {
            var root = Path.GetFullPath(rootDirectory.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar) + Path.DirectorySeparatorChar);
            var fullPath = Path.GetFullPath(candidatePath);
            if (!fullPath.StartsWith(root, StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            if (!File.Exists(fullPath))
            {
                return false;
            }

            File.Delete(fullPath);
            return true;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Không thể dọn file avatar trong storage runtime.");
            throw;
        }
    }
}

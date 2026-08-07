using Microsoft.Extensions.Logging.Abstractions;
using educodeai_server.Services.IdentityDocuments;

namespace educodeai_server.Tests.IdentityDocuments;

public sealed class AvatarStorageCleanupTests
{
    [Fact]
    public async Task DeleteIfInsideRootAsync_DeletesFilesOnlyUnderRoot()
    {
        var root = Path.Combine(Path.GetTempPath(), "educodeai-avatar-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(root);
        var file = Path.Combine(root, "avatar.png");
        await File.WriteAllTextAsync(file, "avatar");
        var outside = Path.Combine(Path.GetTempPath(), "educodeai-outside-" + Guid.NewGuid().ToString("N") + ".png");
        await File.WriteAllTextAsync(outside, "outside");
        try
        {
            var insideDeleted = AvatarStorageCleanup.TryDeleteIfInsideRoot(root, file, NullLogger.Instance);
            var outsideDeleted = AvatarStorageCleanup.TryDeleteIfInsideRoot(root, outside, NullLogger.Instance);

            Assert.True(insideDeleted);
            Assert.False(File.Exists(file));
            Assert.False(outsideDeleted);
            Assert.True(File.Exists(outside));
        }
        finally
        {
            if (Directory.Exists(root)) Directory.Delete(root, recursive: true);
            if (File.Exists(outside)) File.Delete(outside);
        }
    }
}

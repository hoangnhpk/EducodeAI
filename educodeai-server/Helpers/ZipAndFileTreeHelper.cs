using System;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text;
using ICSharpCode.SharpZipLib.Zip;
using Microsoft.AspNetCore.Http;

namespace educodeai_server.Helpers
{
    public static class ZipAndFileTreeHelper
    {
        private static readonly string[] _ignoredFolders = new[] { "node_modules", "bin", "obj", ".git", ".vs", "packages", "dist", "build" };

        public static void GiaiNenVaLocRac(IFormFile zipFile, string targetFolder, string? password = null)
        {
            if (Directory.Exists(targetFolder))
            {
                Directory.Delete(targetFolder, true);
            }
            Directory.CreateDirectory(targetFolder);

            // Save the uploaded zip file temporarily
            string tempZipPath = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString() + ".zip");
            using (var stream = new FileStream(tempZipPath, FileMode.Create))
            {
                zipFile.CopyTo(stream);
            }

            try
            {
                using (var zf = new ICSharpCode.SharpZipLib.Zip.ZipFile(tempZipPath))
                {
                    if (!string.IsNullOrEmpty(password))
                    {
                        zf.Password = password;
                    }

                    foreach (ZipEntry zipEntry in zf)
                    {
                        if (!zipEntry.IsFile)
                            continue; // Skip directories, we create them automatically

                        var pathParts = zipEntry.Name.Split(new[] { '/', '\\' }, StringSplitOptions.RemoveEmptyEntries);
                        bool isIgnored = pathParts.Any(part => _ignoredFolders.Contains(part, StringComparer.OrdinalIgnoreCase));

                        if (isIgnored) continue;

                        string destinationPath = Path.GetFullPath(Path.Combine(targetFolder, zipEntry.Name));

                        if (!destinationPath.StartsWith(Path.GetFullPath(targetFolder), StringComparison.OrdinalIgnoreCase))
                            continue;

                        string? directoryPath = Path.GetDirectoryName(destinationPath);
                        if (directoryPath is null)
                            continue;

                        Directory.CreateDirectory(directoryPath);
                        
                        using (var zipStream = zf.GetInputStream(zipEntry))
                        using (var fs = new FileStream(destinationPath, FileMode.Create))
                        {
                            zipStream.CopyTo(fs);
                        }
                    }
                }
            }
            finally
            {
                if (File.Exists(tempZipPath))
                {
                    File.Delete(tempZipPath);
                }
            }
        }

        public static string TaoCayThuMuc(string folderPath)
        {
            var sb = new StringBuilder();
            sb.AppendLine("Cấu trúc dự án:");
            BuildTree(new DirectoryInfo(folderPath), sb, "", true);
            return sb.ToString();
        }

        private static void BuildTree(DirectoryInfo dir, StringBuilder sb, string indent, bool isLast)
        {
            sb.Append(indent);
            if (isLast)
            {
                sb.Append(@"\-- ");
                indent += "    ";
            }
            else
            {
                sb.Append("+-- ");
                indent += "|   ";
            }
            sb.AppendLine(dir.Name + "/");

            var subDirs = dir.GetDirectories().Where(d => !_ignoredFolders.Contains(d.Name, StringComparer.OrdinalIgnoreCase)).OrderBy(d => d.Name).ToArray();
            var files = dir.GetFiles().OrderBy(f => f.Name).ToArray();

            for (int i = 0; i < subDirs.Length; i++)
            {
                bool isLastItem = (i == subDirs.Length - 1) && (files.Length == 0);
                BuildTree(subDirs[i], sb, indent, isLastItem);
            }

            for (int i = 0; i < files.Length; i++)
            {
                sb.Append(indent);
                if (i == files.Length - 1)
                {
                    sb.Append(@"\-- ");
                }
                else
                {
                    sb.Append("+-- ");
                }
                sb.AppendLine(files[i].Name);
            }
        }
    }
}

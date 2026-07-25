using System.Security.Cryptography;
using System.Text;

namespace educodeai_server.Helpers
{
    public static class MaHoaHelper
    {
        // AES yêu cầu key dài đúng 16 / 24 / 32 byte (AES-128/192/256).
        private static byte[] LayKeyBytesHopLe(string keyBiMat)
        {
            byte[] keyBytes = Encoding.UTF8.GetBytes(keyBiMat ?? string.Empty);
            if (keyBytes.Length != 16 && keyBytes.Length != 24 && keyBytes.Length != 32)
            {
                throw new ArgumentException(
                    $"ApiSecurity:SecretKey phải dài 16/24/32 byte cho AES (hiện tại: {keyBytes.Length} byte).");
            }
            return keyBytes;
        }

        // Cần 32 ký tự cho AES-256
        public static string MaHoa(string textGoc, string keyBiMat)
        {
            if (string.IsNullOrEmpty(textGoc)) return null!;

            byte[] keyBytes = LayKeyBytesHopLe(keyBiMat);
            using (Aes aes = Aes.Create())
            {
                aes.Key = keyBytes;
                aes.GenerateIV(); // IV ngẫu nhiên mỗi lần
                byte[] iv = aes.IV;

                using (var encryptor = aes.CreateEncryptor(aes.Key, iv))
                using (var ms = new MemoryStream())
                {
                    // Ghi 16 bytes IV vào đầu
                    ms.Write(iv, 0, iv.Length);

                    using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
                    using (var sw = new StreamWriter(cs))
                    {
                        sw.Write(textGoc);
                    }
                    return Convert.ToBase64String(ms.ToArray());
                }
            }
        }

        // Hàm này ông sẽ dùng khi lấy từ Redis ra để gọi API AI
        public static string GiaiMa(string textDaMaHoa, string keyBiMat)
        {
            if (string.IsNullOrEmpty(textDaMaHoa)) return null!;

            byte[] fullBytes = Convert.FromBase64String(textDaMaHoa);
            if (fullBytes.Length < 16)
            {
                throw new ArgumentException("Dữ liệu mã hóa không hợp lệ: thiếu 16 byte IV ở đầu.");
            }
            byte[] keyBytes = LayKeyBytesHopLe(keyBiMat);

            using (Aes aes = Aes.Create())
            {
                aes.Key = keyBytes;
                byte[] iv = new byte[16];
                byte[] cipherText = new byte[fullBytes.Length - 16];

                // Bốc 16 bytes đầu làm IV
                Buffer.BlockCopy(fullBytes, 0, iv, 0, 16);
                Buffer.BlockCopy(fullBytes, 16, cipherText, 0, cipherText.Length);

                aes.IV = iv;
                using (var decryptor = aes.CreateDecryptor(aes.Key, aes.IV))
                using (var ms = new MemoryStream(cipherText))
                using (var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read))
                using (var sr = new StreamReader(cs))
                {
                    return sr.ReadToEnd();
                }
            }
        }
    }
}

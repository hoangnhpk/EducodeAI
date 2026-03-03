using System.Security.Claims;

namespace educodeai_server.Helpers
{
    public static class LayNguoiDungID
    {
        public static int LayID(ClaimsPrincipal user)
        {
            if (user?.Identity?.IsAuthenticated != true)
                return 0;

            var idClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!string.IsNullOrEmpty(idClaim) && int.TryParse(idClaim, out int userId))
                return userId;

            return 0;
        }
    }
}

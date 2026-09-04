using System.Reflection;
using educodeai_server.Controllers;
using educodeai_server.DTOs.XacThuc;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authorization;

namespace educodeai_server.Tests.Auth;

public sealed class RemoteLogoutEndpointSecurityTests
{
    [Fact]
    public void SendAndVerify_RequireAuthenticatedUser()
    {
        var send = typeof(XacThucController).GetMethod(nameof(XacThucController.YeuCauOtpDangXuatTuXa));
        var verify = typeof(XacThucController).GetMethod(nameof(XacThucController.XacNhanDangXuatTuXa));

        Assert.NotNull(send!.GetCustomAttribute<AuthorizeAttribute>());
        Assert.NotNull(verify!.GetCustomAttribute<AuthorizeAttribute>());
    }

    [Fact]
    public void SendContract_UsesAuthenticatedUserWithoutRequestBody()
    {
        var controllerMethod = typeof(XacThucController).GetMethod(nameof(XacThucController.YeuCauOtpDangXuatTuXa));
        Assert.Empty(controllerMethod!.GetParameters());

        var serviceMethod = typeof(IXacThucService).GetMethod(nameof(IXacThucService.YeuCauOtpDangXuatTuXaAsync));
        Assert.Equal(new[] { typeof(int) }, serviceMethod!.GetParameters().Select(p => p.ParameterType));
    }

    [Fact]
    public void VerifyContract_CarriesLogoutSelectionToServiceBoundary()
    {
        var controllerMethod = typeof(XacThucController).GetMethod(nameof(XacThucController.XacNhanDangXuatTuXa));
        Assert.Equal(typeof(DangXuatTuXaRequest), Assert.Single(controllerMethod!.GetParameters()).ParameterType);

        var serviceMethod = typeof(IXacThucService).GetMethod(nameof(IXacThucService.XacNhanDangXuatTuXaAsync));
        Assert.Equal(new[] { typeof(int), typeof(DangXuatTuXaRequest) }, serviceMethod!.GetParameters().Select(p => p.ParameterType));
    }
}

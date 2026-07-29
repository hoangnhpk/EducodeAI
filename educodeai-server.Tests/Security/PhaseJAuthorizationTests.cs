using System.Reflection;
using educodeai_server.Controllers;
using educodeai_server.Controllers.QuanTriVien;
using Microsoft.AspNetCore.Authorization;

namespace educodeai_server.Tests.Security;

public sealed class PhaseJAuthorizationTests
{
    [Fact]
    public void QuanLyNguoiDungController_RequiresAdminRole()
    {
        var authorize = typeof(QuanLyNguoiDungController)
            .GetCustomAttribute<AuthorizeAttribute>(inherit: true);

        Assert.NotNull(authorize);
        Assert.Equal("Admin", authorize!.Roles);
    }

    [Fact]
    public void QuanLyNguoiDungController_HasNoAnonymousMutations()
    {
        var actions = typeof(QuanLyNguoiDungController)
            .GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly);

        Assert.All(actions, action =>
            Assert.Null(action.GetCustomAttribute<AllowAnonymousAttribute>()));
    }

    [Fact]
    public void QuanLyHocVienController_RequiresAdminRole()
    {
        var authorize = typeof(QuanLyHocVienController)
            .GetCustomAttribute<AuthorizeAttribute>(inherit: true);

        Assert.NotNull(authorize);
        Assert.Equal("Admin", authorize!.Roles);
    }

    [Fact]
    public void QuanLyHocVienController_HasNoAnonymousMutations()
    {
        var actions = typeof(QuanLyHocVienController)
            .GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly);

        Assert.All(actions, action =>
            Assert.Null(action.GetCustomAttribute<AllowAnonymousAttribute>()));
    }

    [Fact]
    public void CauHinhHeThongController_RequiresAdminRole()
    {
        var authorize = typeof(CauHinhHeThongController)
            .GetCustomAttribute<AuthorizeAttribute>(inherit: true);

        Assert.NotNull(authorize);
        Assert.Equal("Admin", authorize!.Roles);
    }

    [Theory]
    [InlineData(nameof(CauHinhHeThongController.GetCauHinh))]
    [InlineData(nameof(CauHinhHeThongController.CheckBaoTri))]
    public void CauHinhHeThongController_PublicReadsAllowAnonymous(string methodName)
    {
        var method = typeof(CauHinhHeThongController).GetMethod(methodName);

        Assert.NotNull(method);
        Assert.NotNull(method!.GetCustomAttribute<AllowAnonymousAttribute>());
    }

    [Theory]
    [InlineData(nameof(CauHinhHeThongController.ToggleBaoTri))]
    [InlineData(nameof(CauHinhHeThongController.UpdateCauHinh))]
    [InlineData(nameof(CauHinhHeThongController.UploadBanner))]
    public void CauHinhHeThongController_MutationsAreAdminOnly(string methodName)
    {
        var method = typeof(CauHinhHeThongController).GetMethod(methodName);

        Assert.NotNull(method);
        // Không được có AllowAnonymous — thừa hưởng [Authorize(Roles="Admin")] cấp controller.
        Assert.Null(method!.GetCustomAttribute<AllowAnonymousAttribute>());
    }
}

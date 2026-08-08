using educodeai_server.Data;
using educodeai_server.Models;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Services.Security;

public sealed class SessionUpsert
{
    private const string InsertSavepoint = "session_insert";
    private readonly EduCodeAIDbContext _context;

    public SessionUpsert(EduCodeAIDbContext context)
    {
        _context = context;
    }

    public async Task<PhienDangNhapModel> GetOrCreateAsync(
        int userId,
        string deviceId,
        string deviceName,
        bool grantTrust,
        int trustVersion,
        CancellationToken cancellationToken = default)
    {
        var session = await FindAsync(userId, deviceId, cancellationToken);
        if (session is null)
        {
            session = await InsertOrReloadCanonicalAsync(userId, deviceId, deviceName, cancellationToken);
        }

        var now = DateTime.UtcNow;
        session.TenThietBi = deviceName;
        session.ThoiGianHoatDongCuoi = now;
        session.DangHoatDong = true;
        if (grantTrust)
        {
            session.LastVerifiedAtUtc = now;
            session.TrustedUntilUtc = now.AddDays(30);
            session.TrustRevokedAtUtc = null;
            session.TrustVersion = trustVersion;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return session;
    }

    private Task<PhienDangNhapModel?> FindAsync(int userId, string deviceId, CancellationToken cancellationToken) =>
        _context.PhienDangNhaps.FirstOrDefaultAsync(
            session => session.MaNguoiDung == userId && session.MaThietBi == deviceId,
            cancellationToken);

    private async Task<PhienDangNhapModel> InsertOrReloadCanonicalAsync(
        int userId,
        string deviceId,
        string deviceName,
        CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var candidate = new PhienDangNhapModel
        {
            MaNguoiDung = userId,
            MaThietBi = deviceId,
            TenThietBi = deviceName,
            ThoiGianDangNhap = now,
            ThoiGianHoatDongCuoi = now,
            DangHoatDong = true
        };
        var transaction = _context.Database.CurrentTransaction;
        if (transaction?.SupportsSavepoints == true)
        {
            await transaction.CreateSavepointAsync(InsertSavepoint, cancellationToken);
        }

        _context.PhienDangNhaps.Add(candidate);
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
            if (transaction?.SupportsSavepoints == true)
            {
                await transaction.ReleaseSavepointAsync(InsertSavepoint, cancellationToken);
            }
            return candidate;
        }
        catch (DbUpdateException exception)
        {
            if (transaction?.SupportsSavepoints == true)
            {
                await transaction.RollbackToSavepointAsync(InsertSavepoint, cancellationToken);
            }
            _context.Entry(candidate).State = EntityState.Detached;
            return await FindAsync(userId, deviceId, cancellationToken)
                ?? throw new DbUpdateException("The canonical session could not be reloaded after an insert conflict.", exception);
        }
    }
}

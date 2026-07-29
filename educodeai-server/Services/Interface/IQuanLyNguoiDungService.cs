using educodeai_server.Common;
using educodeai_server.DTOs.NguoiDung;
using educodeai_server.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace educodeai_server.Services.Interface
{
    public interface IQuanLyNguoiDungService
    {
        Task<PagedResult<QuanLyNguoiDungDTO>> LayDanhSachNguoiDungAsync(NguoiDungFilterDTO filter);
        Task<bool> KhoaNguoiDungAsync(string id, string lyDo = "", string thoiHan = "");
        Task<bool> XoaNguoiDungAsync(string id);
        Task<bool> ThemNguoiDungAsync(ThemNguoiDungDTO Create);
        Task<bool> CapNhatNguoiDungAsync(string id, CapNhatNguoiDungDTO Update);
    }
}
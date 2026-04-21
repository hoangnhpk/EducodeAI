using educodeai_server.DTOs.NguoiDung;
using educodeai_server.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace educodeai_server.Services.Interface
{
    public interface IQuanLyNguoiDungService
    {
        Task<IEnumerable<QuanLyNguoiDungDTO>> LayDanhSachNguoiDungAsync();
        Task<bool> KhoaNguoiDungAsync(string id, string lyDo = "", string thoiHan = "");
        Task<bool> XoaNguoiDungAsync(string id);
        Task<bool> ThemNguoiDungAsync(ThemNguoiDungDTO Create);
        Task<bool> CapNhatNguoiDungAsync(string id, CapNhatNguoiDungDTO Update);
    }
}
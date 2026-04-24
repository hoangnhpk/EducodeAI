using educodeai_server.Helpers;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestPdfController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            try
            {
                var bytes = ChungChiPdfHelper.TaoPdf(new ChungChiPdfRequest
                {
                    TenChungChi = "Test",
                    HoTenHocVien = "Test Name",
                    TenKhoaHoc = "Test Course",
                    MaChungChi = "12345",
                    NgayCap = System.DateTime.Now,
                    DiemSo = 95
                });
                return File(bytes, "application/pdf");
            }
            catch (System.Exception ex)
            {
                return Content(ex.ToString(), "text/plain");
            }
        }
    }
}

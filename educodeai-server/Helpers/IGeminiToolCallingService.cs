using System.Collections.Generic;
using System.Threading.Tasks;

namespace educodeai_server.Helpers
{
    public interface IGeminiToolCallingService
    {
        Task<string> GenerateWithToolsAsync(List<object> contents, object tools);
    }
}

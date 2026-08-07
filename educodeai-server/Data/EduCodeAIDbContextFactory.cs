using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace educodeai_server.Data
{
    public class EduCodeAIDbContextFactory : IDesignTimeDbContextFactory<EduCodeAIDbContext>
    {
        public EduCodeAIDbContext CreateDbContext(string[] args)
        {
            var basePath = Directory.GetCurrentDirectory();
            var configuration = new ConfigurationBuilder()
                .SetBasePath(basePath)
                .AddJsonFile("appsettings.json", optional: false)
                .AddJsonFile("appsettings.Development.json", optional: true)
                .AddUserSecrets<EduCodeAIDbContextFactory>(optional: true)
                .AddEnvironmentVariables()
                .Build();

            var connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

            var optionsBuilder = new DbContextOptionsBuilder<EduCodeAIDbContext>();
            optionsBuilder.UseNpgsql(connectionString);

            return new EduCodeAIDbContext(optionsBuilder.Options);
        }
    }
}

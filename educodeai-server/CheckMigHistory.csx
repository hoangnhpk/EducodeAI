using Npgsql;

var connStr = "Host=aws-1-ap-south-1.pooler.supabase.com;Database=postgres;Username=postgres.wvadgecrsngseayxijri;Password=NewBieEduCodeAI;SSL Mode=Require;Trust Server Certificate=true";
using var conn = new NpgsqlConnection(connStr);
conn.Open();

// First check what's already in history
using (var cmd = new NpgsqlCommand("SELECT \"MigrationId\" FROM \"__EFMigrationsHistory\" ORDER BY \"MigrationId\"", conn))
using (var reader = cmd.ExecuteReader())
{
    Console.WriteLine("=== Existing migrations in DB ===");
    while (reader.Read()) Console.WriteLine(reader.GetString(0));
}

conn.Close();

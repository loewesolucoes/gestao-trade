using domain;
using Microsoft.EntityFrameworkCore;

namespace repository
{
    public class DashContext : DbContext
    {
        public DbSet<Intraday> History { get; set; }
        public DbSet<Stock> Stocks { get; set; }
        public DbSet<StockUpdate> StockUpdates { get; set; }

        public DashContext()
        {
        }

        public DashContext(DbContextOptions<DashContext> options) : base(options)
        {
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
            optionsBuilder.UseNpgsql("Host=localhost:5432;Database=ericoloewe;Username=postgres;Password=").EnableSensitiveDataLogging();
        }

        public override int SaveChanges(bool acceptAllChangesOnSuccess)
        {
            OnBeforeSaving();
            return base.SaveChanges(acceptAllChangesOnSuccess);
        }

        public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess,
            CancellationToken cancellationToken = new CancellationToken())
        {
            OnBeforeSaving();
            return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
        }

        protected virtual void OnBeforeSaving()
        {
            foreach (var entry in ChangeTracker.Entries())
                switch (entry.State)
                {
                    // Write creation date
                    case EntityState.Added when entry.Entity is ICreationTrackable:
                        entry.Property(nameof(ICreationTrackable.CreatedAt)).CurrentValue = DateTime.UtcNow;
                        break;

                    // Soft delete entity
                    case EntityState.Deleted when entry.Entity is ISoftDeletable:
                        entry.State = EntityState.Unchanged;
                        entry.Property(nameof(ISoftDeletable.DeletedAt)).CurrentValue = DateTime.UtcNow;
                        break;

                    // Write modification date
                    case EntityState.Modified when entry.Entity is IModificationTrackable:
                        entry.Property(nameof(IModificationTrackable.ModifiedAt)).CurrentValue = DateTime.UtcNow;
                        break;
                }
        }
        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<Intraday>()
                .HasIndex(u => u.StockId);

            builder.Entity<StockUpdate>()
                .HasIndex(u => u.StockId);
        }
    }
}


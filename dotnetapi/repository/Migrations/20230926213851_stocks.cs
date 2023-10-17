using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace repository.Migrations
{
    /// <inheritdoc />
    public partial class stocks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Logo",
                table: "Stocks",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "MarketCap",
                table: "Stocks",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Sector",
                table: "Stocks",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Stocks",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "AdjustedClose",
                table: "History",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Logo",
                table: "Stocks");

            migrationBuilder.DropColumn(
                name: "MarketCap",
                table: "Stocks");

            migrationBuilder.DropColumn(
                name: "Sector",
                table: "Stocks");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Stocks");

            migrationBuilder.DropColumn(
                name: "AdjustedClose",
                table: "History");
        }
    }
}

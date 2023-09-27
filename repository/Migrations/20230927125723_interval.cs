using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace repository.Migrations
{
    /// <inheritdoc />
    public partial class interval : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Update",
                table: "StockUpdates");

            migrationBuilder.RenameColumn(
                name: "Type",
                table: "History",
                newName: "Interval");

            migrationBuilder.AddColumn<int>(
                name: "Interval",
                table: "StockUpdates",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Interval",
                table: "StockUpdates");

            migrationBuilder.RenameColumn(
                name: "Interval",
                table: "History",
                newName: "Type");

            migrationBuilder.AddColumn<DateTime>(
                name: "Update",
                table: "StockUpdates",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }
    }
}

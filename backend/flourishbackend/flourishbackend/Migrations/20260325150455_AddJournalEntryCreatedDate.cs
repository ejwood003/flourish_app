using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace flourishbackend.Migrations
{
    /// <inheritdoc />
    public partial class AddJournalEntryCreatedDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "JournalEntries",
                type: "TEXT",
                nullable: false,
                defaultValueSql: "datetime('now')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "JournalEntries");
        }
    }
}

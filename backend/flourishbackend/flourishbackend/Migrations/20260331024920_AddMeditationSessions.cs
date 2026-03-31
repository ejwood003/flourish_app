using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace flourishbackend.Migrations
{
    /// <inheritdoc />
    public partial class AddMeditationSessions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MeditationSessions",
                columns: table => new
                {
                    MeditationSessionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    MeditationId = table.Column<string>(type: "TEXT", nullable: true),
                    MeditationTitle = table.Column<string>(type: "TEXT", nullable: true),
                    DurationMinutes = table.Column<int>(type: "INTEGER", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    PercentComplete = table.Column<int>(type: "INTEGER", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MeditationSessions", x => x.MeditationSessionId);
                    table.ForeignKey(
                        name: "FK_MeditationSessions_UserProfiles_UserId",
                        column: x => x.UserId,
                        principalTable: "UserProfiles",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MeditationSessions_UserId",
                table: "MeditationSessions",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MeditationSessions");
        }
    }
}

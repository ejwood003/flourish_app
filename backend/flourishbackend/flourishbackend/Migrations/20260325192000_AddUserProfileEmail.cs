using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace flourishbackend.Migrations
{
    /// <inheritdoc />
    public partial class AddUserProfileEmail : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "UserProfiles",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Email",
                table: "UserProfiles");
        }
    }
}

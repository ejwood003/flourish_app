using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace flourishbackend.Migrations
{
    /// <inheritdoc />
    public partial class UserProfileSettingsFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BabyDateOfBirth",
                table: "UserProfiles",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BabyFullName",
                table: "UserProfiles",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BabyGender",
                table: "UserProfiles",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "UserProfiles",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DateOfBirth",
                table: "UserProfiles",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "NotificationsFeedingEnabled",
                table: "UserProfiles",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "NotificationsFeedingTimes",
                table: "UserProfiles",
                type: "TEXT",
                nullable: false,
                defaultValue: "[]");

            migrationBuilder.AddColumn<bool>(
                name: "NotificationsMoodEnabled",
                table: "UserProfiles",
                type: "INTEGER",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "NotificationsMoodTimes",
                table: "UserProfiles",
                type: "TEXT",
                nullable: false,
                defaultValue: "[\"09:00\"]");

            migrationBuilder.AddColumn<bool>(
                name: "NotificationsNapEnabled",
                table: "UserProfiles",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "NotificationsNapTimes",
                table: "UserProfiles",
                type: "TEXT",
                nullable: false,
                defaultValue: "[]");

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "UserProfiles",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "ShareBabyTracking",
                table: "UserProfiles",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ShareJournals",
                table: "UserProfiles",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ShareMood",
                table: "UserProfiles",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "SupportEmail",
                table: "UserProfiles",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SupportPhone",
                table: "UserProfiles",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SupportType",
                table: "UserProfiles",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Username",
                table: "UserProfiles",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "JournalEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Content = table.Column<string>(type: "TEXT", nullable: false),
                    Prompt = table.Column<string>(type: "TEXT", nullable: true),
                    ShareWithPartner = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JournalEntries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SavedResources",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ResourceId = table.Column<string>(type: "TEXT", nullable: false),
                    ResourceType = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SavedResources", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "JournalEntries");

            migrationBuilder.DropTable(
                name: "SavedResources");

            migrationBuilder.DropColumn(
                name: "BabyDateOfBirth",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "BabyFullName",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "BabyGender",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "DateOfBirth",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "NotificationsFeedingEnabled",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "NotificationsFeedingTimes",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "NotificationsMoodEnabled",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "NotificationsMoodTimes",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "NotificationsNapEnabled",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "NotificationsNapTimes",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "ShareBabyTracking",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "ShareJournals",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "ShareMood",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "SupportEmail",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "SupportPhone",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "SupportType",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "Username",
                table: "UserProfiles");
        }
    }
}

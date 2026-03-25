using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace flourishbackend.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdToBabyEntities : Migration
    {
        private const string DevUserId = "11111111-1111-1111-1111-111111111111";

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Nullable first so existing rows do not get an invalid FK before backfill.
            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "BabyProfiles",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "BabyActivities",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "BabyMoods",
                type: "TEXT",
                nullable: true);

            // Guarantees a valid principal for FKs when the DB has no users yet (matches DevUserSeed).
            migrationBuilder.Sql($@"
INSERT OR IGNORE INTO ""UserProfiles"" (""UserId"", ""Username"", ""UserFirstName"", ""UserLastName"", ""Password"", ""PhoneNumber"", ""NotificationsMoodEnabled"", ""NotificationsMoodTimes"", ""NotificationsFeedingEnabled"", ""NotificationsFeedingTimes"", ""NotificationsNapEnabled"", ""NotificationsNapTimes"", ""HomeFeatures"")
VALUES ('{DevUserId}', 'dev_seeduser', 'Dev', 'Seed', '', '', 0, '[]', 0, '[]', 0, '[]', '[""affirmation"",""mood"",""mood_chips"",""mindfulness"",""tasks"",""baby"",""support"",""breathing"",""journal"",""meditations"",""articles""]');
");

            migrationBuilder.Sql(@"
UPDATE ""BabyProfiles"" SET ""UserId"" = (SELECT ""UserId"" FROM ""UserProfiles"" ORDER BY ""UserId"" LIMIT 1) WHERE ""UserId"" IS NULL;
UPDATE ""BabyActivities"" SET ""UserId"" = (SELECT ""bp"".""UserId"" FROM ""BabyProfiles"" AS ""bp"" WHERE ""bp"".""BabyId"" = ""BabyActivities"".""BabyId"") WHERE ""UserId"" IS NULL;
UPDATE ""BabyMoods"" SET ""UserId"" = (SELECT ""bp"".""UserId"" FROM ""BabyProfiles"" AS ""bp"" WHERE ""bp"".""BabyId"" = ""BabyMoods"".""BabyId"") WHERE ""UserId"" IS NULL;
");

            migrationBuilder.Sql($@"
UPDATE ""BabyProfiles"" SET ""UserId"" = '{DevUserId}' WHERE ""UserId"" IS NULL;
UPDATE ""BabyActivities"" SET ""UserId"" = '{DevUserId}' WHERE ""UserId"" IS NULL;
UPDATE ""BabyMoods"" SET ""UserId"" = '{DevUserId}' WHERE ""UserId"" IS NULL;
");

            migrationBuilder.AlterColumn<Guid>(
                name: "UserId",
                table: "BabyProfiles",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "UserId",
                table: "BabyActivities",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "UserId",
                table: "BabyMoods",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_BabyProfiles_UserId",
                table: "BabyProfiles",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_BabyMoods_UserId",
                table: "BabyMoods",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_BabyActivities_UserId",
                table: "BabyActivities",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_BabyActivities_UserProfiles_UserId",
                table: "BabyActivities",
                column: "UserId",
                principalTable: "UserProfiles",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BabyMoods_UserProfiles_UserId",
                table: "BabyMoods",
                column: "UserId",
                principalTable: "UserProfiles",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BabyProfiles_UserProfiles_UserId",
                table: "BabyProfiles",
                column: "UserId",
                principalTable: "UserProfiles",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BabyActivities_UserProfiles_UserId",
                table: "BabyActivities");

            migrationBuilder.DropForeignKey(
                name: "FK_BabyMoods_UserProfiles_UserId",
                table: "BabyMoods");

            migrationBuilder.DropForeignKey(
                name: "FK_BabyProfiles_UserProfiles_UserId",
                table: "BabyProfiles");

            migrationBuilder.DropIndex(
                name: "IX_BabyProfiles_UserId",
                table: "BabyProfiles");

            migrationBuilder.DropIndex(
                name: "IX_BabyMoods_UserId",
                table: "BabyMoods");

            migrationBuilder.DropIndex(
                name: "IX_BabyActivities_UserId",
                table: "BabyActivities");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "BabyProfiles");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "BabyMoods");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "BabyActivities");
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace flourishbackend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Affirmations",
                columns: table => new
                {
                    AffirmationId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Text = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Affirmations", x => x.AffirmationId);
                });

            migrationBuilder.CreateTable(
                name: "BabyProfiles",
                columns: table => new
                {
                    BabyId = table.Column<Guid>(type: "TEXT", nullable: false),
                    BabyName = table.Column<string>(type: "TEXT", nullable: false),
                    BabyDateOfBirth = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BabyProfiles", x => x.BabyId);
                });

            migrationBuilder.CreateTable(
                name: "UserProfiles",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Username = table.Column<string>(type: "TEXT", nullable: false),
                    UserFirstName = table.Column<string>(type: "TEXT", nullable: false),
                    UserLastName = table.Column<string>(type: "TEXT", nullable: false),
                    Password = table.Column<string>(type: "TEXT", nullable: false),
                    PhoneNumber = table.Column<string>(type: "TEXT", nullable: false),
                    NotificationsMoodEnabled = table.Column<bool>(type: "INTEGER", nullable: false),
                    NotificationsMoodTimes = table.Column<string>(type: "TEXT", nullable: false),
                    NotificationsFeedingEnabled = table.Column<bool>(type: "INTEGER", nullable: false),
                    NotificationsFeedingTimes = table.Column<string>(type: "TEXT", nullable: false),
                    NotificationsNapEnabled = table.Column<bool>(type: "INTEGER", nullable: false),
                    NotificationsNapTimes = table.Column<string>(type: "TEXT", nullable: false),
                    HomeFeatures = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserProfiles", x => x.UserId);
                });

            migrationBuilder.CreateTable(
                name: "BabyActivities",
                columns: table => new
                {
                    BabyActivityId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Type = table.Column<string>(type: "TEXT", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    DurationMinutes = table.Column<int>(type: "INTEGER", nullable: true),
                    Notes = table.Column<string>(type: "TEXT", nullable: true),
                    BreastSide = table.Column<string>(type: "TEXT", nullable: true),
                    AmountOz = table.Column<float>(type: "REAL", nullable: true),
                    FoodType = table.Column<string>(type: "TEXT", nullable: true),
                    FoodAmount = table.Column<string>(type: "TEXT", nullable: true),
                    CustomType = table.Column<string>(type: "TEXT", nullable: true),
                    BabyId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BabyActivities", x => x.BabyActivityId);
                    table.ForeignKey(
                        name: "FK_BabyActivities_BabyProfiles_BabyId",
                        column: x => x.BabyId,
                        principalTable: "BabyProfiles",
                        principalColumn: "BabyId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BabyMoods",
                columns: table => new
                {
                    BabyMoodId = table.Column<Guid>(type: "TEXT", nullable: false),
                    MoodValue = table.Column<int>(type: "INTEGER", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Tags = table.Column<string>(type: "TEXT", nullable: false),
                    BabyId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BabyMoods", x => x.BabyMoodId);
                    table.ForeignKey(
                        name: "FK_BabyMoods_BabyProfiles_BabyId",
                        column: x => x.BabyId,
                        principalTable: "BabyProfiles",
                        principalColumn: "BabyId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AffirmationReactions",
                columns: table => new
                {
                    AffirmationReactionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    AffirmationId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Reaction = table.Column<string>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AffirmationReactions", x => x.AffirmationReactionId);
                    table.ForeignKey(
                        name: "FK_AffirmationReactions_Affirmations_AffirmationId",
                        column: x => x.AffirmationId,
                        principalTable: "Affirmations",
                        principalColumn: "AffirmationId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AffirmationReactions_UserProfiles_UserId",
                        column: x => x.UserId,
                        principalTable: "UserProfiles",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "JournalEntries",
                columns: table => new
                {
                    JournalEntryId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Content = table.Column<string>(type: "TEXT", nullable: false),
                    Prompt = table.Column<string>(type: "TEXT", nullable: true),
                    ShareWithPartner = table.Column<bool>(type: "INTEGER", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JournalEntries", x => x.JournalEntryId);
                    table.ForeignKey(
                        name: "FK_JournalEntries_UserProfiles_UserId",
                        column: x => x.UserId,
                        principalTable: "UserProfiles",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MoodEntries",
                columns: table => new
                {
                    MoodEntryId = table.Column<Guid>(type: "TEXT", nullable: false),
                    MoodValue = table.Column<int>(type: "INTEGER", nullable: false),
                    Date = table.Column<string>(type: "TEXT", nullable: false),
                    Time = table.Column<string>(type: "TEXT", nullable: true),
                    MoodLabel = table.Column<string>(type: "TEXT", nullable: true),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MoodEntries", x => x.MoodEntryId);
                    table.ForeignKey(
                        name: "FK_MoodEntries_UserProfiles_UserId",
                        column: x => x.UserId,
                        principalTable: "UserProfiles",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SavedResources",
                columns: table => new
                {
                    SavedResourceId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ResourceId = table.Column<string>(type: "TEXT", nullable: false),
                    ResourceType = table.Column<string>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SavedResources", x => x.SavedResourceId);
                    table.ForeignKey(
                        name: "FK_SavedResources_UserProfiles_UserId",
                        column: x => x.UserId,
                        principalTable: "UserProfiles",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SupportProfiles",
                columns: table => new
                {
                    SupportId = table.Column<Guid>(type: "TEXT", nullable: false),
                    SupportType = table.Column<string>(type: "TEXT", nullable: true),
                    SupportName = table.Column<string>(type: "TEXT", nullable: true),
                    SupportEmail = table.Column<string>(type: "TEXT", nullable: true),
                    SupportPhone = table.Column<string>(type: "TEXT", nullable: true),
                    ShareJournals = table.Column<bool>(type: "INTEGER", nullable: false),
                    ShareMood = table.Column<bool>(type: "INTEGER", nullable: false),
                    ShareBabyTracking = table.Column<bool>(type: "INTEGER", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupportProfiles", x => x.SupportId);
                    table.ForeignKey(
                        name: "FK_SupportProfiles_UserProfiles_UserId",
                        column: x => x.UserId,
                        principalTable: "UserProfiles",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SupportRequests",
                columns: table => new
                {
                    SupportRequestId = table.Column<Guid>(type: "TEXT", nullable: false),
                    RequestText = table.Column<string>(type: "TEXT", nullable: false),
                    IsCustom = table.Column<bool>(type: "INTEGER", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupportRequests", x => x.SupportRequestId);
                    table.ForeignKey(
                        name: "FK_SupportRequests_UserProfiles_UserId",
                        column: x => x.UserId,
                        principalTable: "UserProfiles",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AffirmationReactions_AffirmationId",
                table: "AffirmationReactions",
                column: "AffirmationId");

            migrationBuilder.CreateIndex(
                name: "IX_AffirmationReactions_UserId",
                table: "AffirmationReactions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_BabyActivities_BabyId",
                table: "BabyActivities",
                column: "BabyId");

            migrationBuilder.CreateIndex(
                name: "IX_BabyMoods_BabyId",
                table: "BabyMoods",
                column: "BabyId");

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntries_UserId",
                table: "JournalEntries",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_MoodEntries_UserId",
                table: "MoodEntries",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_SavedResources_UserId",
                table: "SavedResources",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_SupportProfiles_UserId",
                table: "SupportProfiles",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_SupportRequests_UserId",
                table: "SupportRequests",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AffirmationReactions");

            migrationBuilder.DropTable(
                name: "BabyActivities");

            migrationBuilder.DropTable(
                name: "BabyMoods");

            migrationBuilder.DropTable(
                name: "JournalEntries");

            migrationBuilder.DropTable(
                name: "MoodEntries");

            migrationBuilder.DropTable(
                name: "SavedResources");

            migrationBuilder.DropTable(
                name: "SupportProfiles");

            migrationBuilder.DropTable(
                name: "SupportRequests");

            migrationBuilder.DropTable(
                name: "Affirmations");

            migrationBuilder.DropTable(
                name: "BabyProfiles");

            migrationBuilder.DropTable(
                name: "UserProfiles");
        }
    }
}

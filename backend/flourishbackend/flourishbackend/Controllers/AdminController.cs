using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using flourishbackend.Data;

namespace flourishbackend.Controllers
{
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly FlourishDbContext _context;

        public AdminController(FlourishDbContext context)
        {
            _context = context;
        }

        // ─── GET /admin ───────────────────────────────────────────────────────────
        [HttpGet("/admin")]
        [Produces("text/html")]
        public ContentResult Dashboard()
        {
            return Content(AdminHtml, "text/html");
        }

        // ─── GET /api/admin/kr-metrics ────────────────────────────────────────────
        [HttpGet("/api/admin/kr-metrics")]
        public async Task<IActionResult> GetKrMetrics()
        {
            // Identify partner accounts (they have a SupportProfile row)
            var partnerUserIds = await _context.SupportProfiles
                .AsNoTracking()
                .Select(s => s.UserId)
                .ToListAsync();

            // Mother users only
            var users = await _context.UserProfiles
                .AsNoTracking()
                .Where(u => !partnerUserIds.Contains(u.UserId))
                .ToListAsync();

            var userIds = users.Select(u => u.UserId).ToList();

            // Pull all mood entries for mother users in one query
            var allMoodEntries = await _context.MoodEntries
                .AsNoTracking()
                .Where(m => userIds.Contains(m.UserId))
                .ToListAsync();

            // Pull all meditation sessions for mother users
            var allSessions = await _context.MeditationSessions
                .AsNoTracking()
                .Where(s => userIds.Contains(s.UserId))
                .ToListAsync();

            // Pre-parse dates once to avoid repeated TryParse calls
            var parsedEntries = allMoodEntries
                .Select(m => new
                {
                    m.UserId,
                    m.MoodValue,
                    Date = DateOnly.TryParse(m.Date, out var d) ? (DateOnly?)d : null
                })
                .Where(m => m.Date.HasValue)
                .ToList();

            // ── KR2: % of users who logged mood on 3+ distinct days in first 10 days ──
            int kr2Numerator = 0;
            var kr2Denominator = users.Count;
            var kr2UserBreakdown = new List<object>();

            foreach (var user in users)
            {
                var createdDate = DateOnly.FromDateTime(user.CreatedDate.Date);
                var cutoff = createdDate.AddDays(10);

                var distinctDays = parsedEntries
                    .Where(m => m.UserId == user.UserId && m.Date >= createdDate && m.Date <= cutoff)
                    .Select(m => m.Date)
                    .Distinct()
                    .Count();

                if (distinctDays >= 3)
                    kr2Numerator++;

                kr2UserBreakdown.Add(new { daysLogged = distinctDays, metTarget = distinctDays >= 3 });
            }

            double kr2Pct = kr2Denominator > 0
                ? Math.Round((double)kr2Numerator / kr2Denominator * 100, 1)
                : 0;

            // ── KR1: % of eligible users who completed a meditation in their first 7 days ──
            // Only denominator = users who have been on the app for at least 7 days
            var kr1EligibleUsers = users.Where(u => (DateTime.UtcNow - u.CreatedDate).TotalDays >= 7).ToList();
            int kr1Numerator = 0;

            foreach (var user in kr1EligibleUsers)
            {
                var cutoff = user.CreatedDate.AddDays(7);
                var hadSession = allSessions.Any(s => s.UserId == user.UserId && s.CompletedAt <= cutoff);
                if (hadSession) kr1Numerator++;
            }

            double kr1Pct = kr1EligibleUsers.Count > 0
                ? Math.Round((double)kr1Numerator / kr1EligibleUsers.Count * 100, 1)
                : 0;

            // ── KR3: Average % improvement in MoodValue after 2 weeks ────────────────
            var improvements = new List<double>();

            foreach (var user in users)
            {
                var createdDate = DateOnly.FromDateTime(user.CreatedDate.Date);
                var baselineEnd = createdDate.AddDays(3);
                var postStart = createdDate.AddDays(14);

                var userEntries = parsedEntries.Where(m => m.UserId == user.UserId).ToList();

                var baselineValues = userEntries
                    .Where(m => m.Date >= createdDate && m.Date <= baselineEnd)
                    .Select(m => (double)m.MoodValue)
                    .ToList();

                var postValues = userEntries
                    .Where(m => m.Date >= postStart)
                    .Select(m => (double)m.MoodValue)
                    .ToList();

                if (baselineValues.Count > 0 && postValues.Count > 0)
                {
                    var baseline = baselineValues.Average();
                    var post = postValues.Average();
                    if (baseline > 0)
                        improvements.Add((post - baseline) / baseline * 100);
                }
            }

            double kr3AvgImprovement = improvements.Count > 0
                ? Math.Round(improvements.Average(), 1)
                : 0;

            // ── Weekly mood trend: last 8 weeks ──────────────────────────────────────
            var eightWeeksAgo = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-56).Date);

            var weeklyTrend = parsedEntries
                .Where(m => m.Date >= eightWeeksAgo)
                .GroupBy(m =>
                {
                    // Days since 8 weeks ago → integer week bucket (0–7)
                    var dayOffset = m.Date!.Value.DayNumber - eightWeeksAgo.DayNumber;
                    return dayOffset / 7;
                })
                .OrderBy(g => g.Key)
                .Select(g => new
                {
                    weekOffset = g.Key,
                    weekLabel = eightWeeksAgo.AddDays(g.Key * 7).ToString("MMM d"),
                    avgMood = Math.Round(g.Average(m => (double)m.MoodValue), 1),
                    entryCount = g.Count()
                })
                .ToList();

            // ── Mood distribution buckets (for bar chart) ─────────────────────────────
            var moodBuckets = new[]
            {
                new { label = "0–19",  min = 0,  max = 19  },
                new { label = "20–39", min = 20, max = 39  },
                new { label = "40–59", min = 40, max = 59  },
                new { label = "60–79", min = 60, max = 79  },
                new { label = "80–100", min = 80, max = 100 },
            };

            var moodDistribution = moodBuckets.Select(b => new
            {
                b.label,
                count = parsedEntries.Count(m => m.MoodValue >= b.min && m.MoodValue <= b.max)
            }).ToList();

            return Ok(new
            {
                generatedAt = DateTime.UtcNow,
                summary = new
                {
                    totalUsers = users.Count,
                    totalMoodEntries = allMoodEntries.Count,
                    totalMeditationSessions = allSessions.Count,
                    avgMoodEntriesPerUser = users.Count > 0
                        ? Math.Round((double)allMoodEntries.Count / users.Count, 1)
                        : 0,
                    usersWithAnyMoodData = parsedEntries.Select(m => m.UserId).Distinct().Count(),
                },
                kr1 = new
                {
                    status = kr1EligibleUsers.Count > 0 ? "live" : "no_eligible_users",
                    target = 70,
                    value = kr1EligibleUsers.Count > 0 ? (double?)kr1Pct : null,
                    numerator = kr1Numerator,
                    denominator = kr1EligibleUsers.Count,
                    description = "% of users who completed a meditation within their first 7 days"
                },
                kr2 = new
                {
                    status = "live",
                    target = 65,
                    value = kr2Pct,
                    numerator = kr2Numerator,
                    denominator = kr2Denominator,
                    description = "% of users who logged mood on 3+ distinct days within their first 10 days"
                },
                kr3 = new
                {
                    status = improvements.Count > 0 ? "live" : "insufficient_data",
                    target = 25,
                    value = kr3AvgImprovement,
                    usersWithData = improvements.Count,
                    description = "Average % change in MoodValue from days 1–3 (baseline) to day 14+ (post period)",
                    message = improvements.Count == 0
                        ? "Not enough users have 14+ days of mood data yet."
                        : (string?)null
                },
                weeklyMoodTrend = weeklyTrend,
                moodDistribution = moodDistribution,
            });
        }

        // ─── Embedded HTML Dashboard ──────────────────────────────────────────────
        private const string AdminHtml = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Flourish — Admin Dashboard</title>
              <link rel="preconnect" href="https://fonts.googleapis.com" />
              <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
              <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
              <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
              <style>
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                :root {
                  --bg:        #0f0d14;
                  --surface:   #1a1625;
                  --surface2:  #231d33;
                  --border:    #2e2640;
                  --purple:    #8b7ab8;
                  --purple-lt: #a990d4;
                  --lavender:  #c4b5e8;
                  --pink:      #d48bb8;
                  --teal:      #70b8c4;
                  --green:     #6baf8b;
                  --amber:     #d4a96a;
                  --red:       #c97b84;
                  --text:      #ede8f5;
                  --muted:     #8a82a0;
                  --radius:    16px;
                }

                body {
                  font-family: 'Outfit', sans-serif;
                  background: var(--bg);
                  color: var(--text);
                  min-height: 100vh;
                  padding: 0 0 60px;
                }

                /* ── Header ── */
                .header {
                  background: linear-gradient(135deg, #231d33 0%, #1a1625 100%);
                  border-bottom: 1px solid var(--border);
                  padding: 24px 40px;
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  flex-wrap: wrap;
                  gap: 12px;
                }
                .header-brand {
                  display: flex;
                  align-items: center;
                  gap: 12px;
                }
                .header-logo {
                  width: 40px;
                  height: 40px;
                  border-radius: 12px;
                  background: linear-gradient(135deg, var(--purple), var(--pink));
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 20px;
                }
                .header-title { font-size: 20px; font-weight: 600; color: var(--text); }
                .header-sub   { font-size: 13px; color: var(--muted); margin-top: 2px; }
                .header-meta  { text-align: right; }
                .header-meta .updated { font-size: 13px; color: var(--muted); }
                .header-meta .updated span { color: var(--lavender); }
                .refresh-btn {
                  margin-top: 6px;
                  background: var(--surface2);
                  border: 1px solid var(--border);
                  color: var(--muted);
                  font-family: inherit;
                  font-size: 12px;
                  padding: 5px 14px;
                  border-radius: 20px;
                  cursor: pointer;
                  transition: all .2s;
                }
                .refresh-btn:hover { border-color: var(--purple); color: var(--lavender); }

                /* ── Objective Banner ── */
                .objective {
                  margin: 32px 40px 0;
                  background: linear-gradient(135deg, rgba(139,122,184,.12), rgba(212,139,184,.06));
                  border: 1px solid rgba(139,122,184,.25);
                  border-radius: var(--radius);
                  padding: 16px 22px;
                  display: flex;
                  align-items: center;
                  gap: 12px;
                }
                .objective-label {
                  font-size: 10px;
                  font-weight: 700;
                  letter-spacing: .1em;
                  color: var(--purple-lt);
                  text-transform: uppercase;
                  white-space: nowrap;
                  background: rgba(139,122,184,.15);
                  border: 1px solid rgba(139,122,184,.25);
                  border-radius: 6px;
                  padding: 3px 8px;
                  flex-shrink: 0;
                }
                .objective-text {
                  font-size: 13px;
                  color: var(--text);
                  line-height: 1.5;
                  opacity: .85;
                }

                /* ── Grid layout ── */
                .container { padding: 0 40px; }
                .section-label {
                  font-size: 11px;
                  font-weight: 600;
                  letter-spacing: .08em;
                  text-transform: uppercase;
                  color: var(--muted);
                  margin: 36px 0 16px;
                }

                /* ── KR Cards ── */
                .kr-grid {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                  gap: 20px;
                }
                .kr-card {
                  background: var(--surface);
                  border: 1px solid var(--border);
                  border-radius: var(--radius);
                  padding: 28px;
                  position: relative;
                  overflow: hidden;
                  transition: border-color .2s, transform .2s;
                }
                .kr-card:hover { border-color: var(--purple); transform: translateY(-1px); }
                .kr-card::before {
                  content: '';
                  position: absolute;
                  top: 0; left: 0; right: 0;
                  height: 3px;
                  border-radius: var(--radius) var(--radius) 0 0;
                }
                .kr-card.live::before  { background: linear-gradient(90deg, var(--purple), var(--pink)); }
                .kr-card.pending::before { background: linear-gradient(90deg, var(--muted), #3d3455); }
                .kr-card.warn::before  { background: linear-gradient(90deg, var(--amber), var(--red)); }

                .kr-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
                .kr-number { font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }
                .kr-badge {
                  font-size: 10px;
                  font-weight: 600;
                  letter-spacing: .06em;
                  text-transform: uppercase;
                  padding: 3px 10px;
                  border-radius: 20px;
                }
                .badge-live    { background: rgba(107,175,139,.15); color: var(--green); border: 1px solid rgba(107,175,139,.3); }
                .badge-pending { background: rgba(138,130,160,.12); color: var(--muted); border: 1px solid rgba(138,130,160,.2); }
                .badge-warn    { background: rgba(212,169,106,.12); color: var(--amber); border: 1px solid rgba(212,169,106,.25); }

                /* Big % watermark anchored to bottom-right of the card */
                .kr-value-corner {
                  position: absolute;
                  bottom: 18px;
                  right: 22px;
                  text-align: right;
                  pointer-events: none;
                  user-select: none;
                }
                .kr-value-corner .kr-big-pct {
                  font-size: 48px;
                  font-weight: 700;
                  line-height: 1;
                  opacity: .18;
                  color: var(--text);
                  letter-spacing: -2px;
                }
                .kr-card.live   .kr-big-pct { opacity: .22; color: var(--green); }
                .kr-card.warn   .kr-big-pct { opacity: .22; color: var(--amber); }
                .kr-card.pending .kr-big-pct { opacity: .12; }

                .kr-details { }
                .kr-title { font-size: 16px; font-weight: 600; color: var(--text); margin-bottom: 5px; line-height: 1.3; }
                .kr-desc { font-size: 12px; color: var(--muted); line-height: 1.5; margin-bottom: 14px; }
                .kr-target-row { display: flex; align-items: center; gap: 8px; }
                .kr-target-label { font-size: 11px; color: var(--muted); }
                .kr-target-val { font-size: 13px; font-weight: 600; color: var(--lavender); }
                .kr-stat-row { display: flex; gap: 20px; margin-top: 10px; }
                .kr-stat-val { font-size: 18px; font-weight: 600; color: var(--text); }
                .kr-stat-label { font-size: 11px; color: var(--muted); margin-top: 1px; }
                .kr-pending-msg {
                  font-size: 12px;
                  color: var(--muted);
                  line-height: 1.6;
                  font-style: italic;
                  margin-top: 10px;
                }

                /* ── Summary row ── */
                .summary-grid {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
                  gap: 16px;
                }
                .summary-card {
                  background: var(--surface);
                  border: 1px solid var(--border);
                  border-radius: var(--radius);
                  padding: 20px 22px;
                }
                .summary-val   { font-size: 32px; font-weight: 700; color: var(--text); line-height: 1; }
                .summary-label { font-size: 12px; color: var(--muted); margin-top: 6px; }

                /* ── Charts ── */
                .charts-grid {
                  display: grid;
                  grid-template-columns: 2fr 1fr;
                  gap: 20px;
                }
                @media (max-width: 900px) {
                  .charts-grid { grid-template-columns: 1fr; }
                  .header { padding: 20px 24px; }
                  .container { padding: 0 24px; }
                  .objective { margin: 24px 24px 0; }
                }
                .chart-card {
                  background: var(--surface);
                  border: 1px solid var(--border);
                  border-radius: var(--radius);
                  padding: 24px;
                }
                .chart-title { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 4px; }
                .chart-sub   { font-size: 12px; color: var(--muted); margin-bottom: 20px; }
                .chart-canvas-wrap { position: relative; }

                /* ── Loading / Error ── */
                .state-loading, .state-error {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  min-height: 300px;
                  gap: 12px;
                }
                .spinner {
                  width: 40px; height: 40px;
                  border: 3px solid var(--border);
                  border-top-color: var(--purple);
                  border-radius: 50%;
                  animation: spin .8s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                .error-icon { font-size: 32px; }
                .error-msg { font-size: 14px; color: var(--muted); }

                .hidden { display: none !important; }
              </style>
            </head>
            <body>

              <!-- Header -->
              <header class="header">
                <div class="header-brand">
                  <div class="header-logo">🌸</div>
                  <div>
                    <div class="header-title">Flourish Admin</div>
                    <div class="header-sub">Key Results Dashboard</div>
                  </div>
                </div>
                <div class="header-meta">
                  <div class="updated">Last updated: <span id="lastUpdated">—</span></div>
                  <button class="refresh-btn" onclick="loadMetrics()">↻ Refresh</button>
                </div>
              </header>

              <!-- Objective Banner -->
              <div class="objective">
                <div class="objective-label">Objective</div>
                <div class="objective-text">
                  Support postpartum mothers in improving emotional wellbeing through guided meditation, mood tracking, and journaling.
                </div>
              </div>

              <!-- Main content -->
              <div class="container">

                <!-- Loading state -->
                <div id="stateLoading" class="state-loading">
                  <div class="spinner"></div>
                  <div style="color:var(--muted);font-size:14px;">Loading KR data…</div>
                </div>

                <!-- Error state -->
                <div id="stateError" class="state-error hidden">
                  <div class="error-icon">⚠️</div>
                  <div class="error-msg" id="errorMsg">Failed to load metrics.</div>
                  <button class="refresh-btn" onclick="loadMetrics()">Try again</button>
                </div>

                <!-- Dashboard content (hidden until loaded) -->
                <div id="dashContent" class="hidden">

                  <!-- KR Cards -->
                  <div class="section-label">Key Results</div>
                  <div class="kr-grid">

                    <!-- KR1 -->
                    <div class="kr-card live" id="kr1card">
                      <div class="kr-header">
                        <div class="kr-number">KR 1</div>
                        <div class="kr-badge badge-live" id="kr1badge">Live</div>
                      </div>
                      <div class="kr-details">
                          <div class="kr-title">Meditation in Week 1</div>
                          <div class="kr-desc">≥70% of users complete a postpartum meditation within their first 7 days</div>
                          <div class="kr-target-row">
                            <span class="kr-target-label">Target:</span>
                            <span class="kr-target-val">70%</span>
                          </div>
                          <div class="kr-stat-row">
                            <div class="kr-stat">
                              <div class="kr-stat-val" id="kr1num">—</div>
                              <div class="kr-stat-label">met target</div>
                            </div>
                            <div class="kr-stat">
                              <div class="kr-stat-val" id="kr1den">—</div>
                              <div class="kr-stat-label">eligible users</div>
                            </div>
                          </div>
                        </div>
                        <div class="kr-value-corner">
                          <div class="kr-big-pct" id="kr1pct">—</div>
                        </div>
                        <canvas id="gauge1" width="1" height="1" style="display:none"></canvas>
                    </div>

                    <!-- KR2 -->
                    <div class="kr-card live" id="kr2card">
                      <div class="kr-header">
                        <div class="kr-number">KR 2</div>
                        <div class="kr-badge badge-live" id="kr2badge">Live</div>
                      </div>
                      <div class="kr-details">
                          <div class="kr-title">Mood Logging Habit</div>
                          <div class="kr-desc">≥65% of users log mood on 3+ days within first 10 days</div>
                          <div class="kr-target-row">
                            <span class="kr-target-label">Target:</span>
                            <span class="kr-target-val">65%</span>
                          </div>
                          <div class="kr-stat-row">
                            <div class="kr-stat">
                              <div class="kr-stat-val" id="kr2num">—</div>
                              <div class="kr-stat-label">met target</div>
                            </div>
                            <div class="kr-stat">
                              <div class="kr-stat-val" id="kr2den">—</div>
                              <div class="kr-stat-label">total users</div>
                            </div>
                          </div>
                        </div>
                        <div class="kr-value-corner">
                          <div class="kr-big-pct" id="kr2pct">—</div>
                        </div>
                        <canvas id="gauge2" width="1" height="1" style="display:none"></canvas>
                    </div>

                    <!-- KR3 -->
                    <div class="kr-card live" id="kr3card">
                      <div class="kr-header">
                        <div class="kr-number">KR 3</div>
                        <div class="kr-badge badge-live" id="kr3badge">Live</div>
                      </div>
                      <div class="kr-details">
                          <div class="kr-title">Wellbeing Improvement</div>
                          <div class="kr-desc">Average ≥25% improvement in mood score after 2 weeks of consistent use</div>
                          <div class="kr-target-row">
                            <span class="kr-target-label">Target:</span>
                            <span class="kr-target-val">+25%</span>
                          </div>
                          <div class="kr-stat-row">
                            <div class="kr-stat">
                              <div class="kr-stat-val" id="kr3users">—</div>
                              <div class="kr-stat-label">users measured</div>
                            </div>
                          </div>
                          <div class="kr-pending-msg" id="kr3msg"></div>
                        </div>
                        <div class="kr-value-corner">
                          <div class="kr-big-pct" id="kr3pct">—</div>
                        </div>
                        <canvas id="gauge3" width="1" height="1" style="display:none"></canvas>
                    </div>

                  </div>

                  <!-- At-a-glance summary -->
                  <div class="section-label">At a Glance</div>
                  <div class="summary-grid">
                    <div class="summary-card">
                      <div class="summary-val" id="statTotalUsers">—</div>
                      <div class="summary-label">Total Users (mothers)</div>
                    </div>
                    <div class="summary-card">
                      <div class="summary-val" id="statMoodEntries">—</div>
                      <div class="summary-label">Total Mood Entries</div>
                    </div>
                    <div class="summary-card">
                      <div class="summary-val" id="statAvgEntries">—</div>
                      <div class="summary-label">Avg Mood Entries / User</div>
                    </div>
                    <div class="summary-card">
                      <div class="summary-val" id="statActiveUsers">—</div>
                      <div class="summary-label">Users with Mood Data</div>
                    </div>
                  </div>

                  <!-- Charts -->
                  <div class="section-label">Trends</div>
                  <div class="charts-grid">
                    <div class="chart-card">
                      <div class="chart-title">Weekly Average Mood Score</div>
                      <div class="chart-sub">Aggregate mood value (0–100) across all users — last 8 weeks</div>
                      <div class="chart-canvas-wrap">
                        <canvas id="trendChart" height="220"></canvas>
                      </div>
                    </div>
                    <div class="chart-card">
                      <div class="chart-title">Mood Score Distribution</div>
                      <div class="chart-sub">All-time entries by score range</div>
                      <div class="chart-canvas-wrap">
                        <canvas id="distChart" height="220"></canvas>
                      </div>
                    </div>
                  </div>

                </div><!-- /dashContent -->
              </div><!-- /container -->

              <script>
                let trendChart, distChart;

                function gaugeColor(value, target) {
                  if (value === null || value === undefined) return '#3d3455';
                  if (value >= target)  return '#6baf8b';
                  if (value >= target * 0.8) return '#d4a96a';
                  return '#c97b84';
                }

                function buildGauge(canvasId, value, target, maxVal) {
                  const ctx = document.getElementById(canvasId).getContext('2d');
                  const capped = Math.min(Math.max(value || 0, 0), maxVal);
                  const color = gaugeColor(value, target);
                  return new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                      datasets: [{
                        data: [capped, maxVal - capped],
                        backgroundColor: [color, '#231d33'],
                        borderWidth: 0,
                        borderRadius: 4,
                      }]
                    },
                    options: {
                      cutout: '72%',
                      rotation: -90,
                      circumference: 180,
                      plugins: { legend: { display: false }, tooltip: { enabled: false } },
                      animation: { duration: 800, easing: 'easeOutQuart' },
                    }
                  });
                }

                function buildTrendChart(weeklyData) {
                  const ctx = document.getElementById('trendChart').getContext('2d');
                  return new Chart(ctx, {
                    type: 'line',
                    data: {
                      labels: weeklyData.map(w => w.week_label),
                      datasets: [{
                        label: 'Avg Mood Score',
                        data: weeklyData.map(w => w.avg_mood),
                        borderColor: '#8b7ab8',
                        backgroundColor: 'rgba(139,122,184,.12)',
                        borderWidth: 2,
                        pointBackgroundColor: '#a990d4',
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        fill: true,
                        tension: 0.4,
                      }]
                    },
                    options: {
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: '#1a1625',
                          borderColor: '#2e2640',
                          borderWidth: 1,
                          titleColor: '#ede8f5',
                          bodyColor: '#8a82a0',
                          padding: 12,
                          callbacks: {
                            label: ctx => ` Avg score: ${ctx.raw}`,
                          }
                        }
                      },
                      scales: {
                        x: { grid: { color: '#1e1830' }, ticks: { color: '#8a82a0', font: { family: 'Outfit', size: 11 } } },
                        y: {
                          min: 0, max: 100,
                          grid: { color: '#1e1830' },
                          ticks: { color: '#8a82a0', font: { family: 'Outfit', size: 11 }, stepSize: 25 }
                        }
                      }
                    }
                  });
                }

                function buildDistChart(distData) {
                  const ctx = document.getElementById('distChart').getContext('2d');
                  return new Chart(ctx, {
                    type: 'bar',
                    data: {
                      labels: distData.map(d => d.label),
                      datasets: [{
                        label: 'Entries',
                        data: distData.map(d => d.count),
                        backgroundColor: [
                          'rgba(201,123,132,.7)',
                          'rgba(212,169,106,.7)',
                          'rgba(139,122,184,.7)',
                          'rgba(112,184,196,.7)',
                          'rgba(107,175,139,.7)',
                        ],
                        borderRadius: 6,
                        borderWidth: 0,
                      }]
                    },
                    options: {
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: '#1a1625',
                          borderColor: '#2e2640',
                          borderWidth: 1,
                          titleColor: '#ede8f5',
                          bodyColor: '#8a82a0',
                          padding: 12,
                        }
                      },
                      scales: {
                        x: { grid: { display: false }, ticks: { color: '#8a82a0', font: { family: 'Outfit', size: 11 } } },
                        y: {
                          grid: { color: '#1e1830' },
                          ticks: { color: '#8a82a0', font: { family: 'Outfit', size: 11 } },
                          beginAtZero: true,
                        }
                      }
                    }
                  });
                }

                async function loadMetrics() {
                  document.getElementById('stateLoading').classList.remove('hidden');
                  document.getElementById('stateError').classList.add('hidden');
                  document.getElementById('dashContent').classList.add('hidden');

                  try {
                    const resp = await fetch('/api/admin/kr-metrics');
                    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                    const data = await resp.json();
                    renderDashboard(data);
                  } catch (e) {
                    document.getElementById('stateLoading').classList.add('hidden');
                    document.getElementById('stateError').classList.remove('hidden');
                    document.getElementById('errorMsg').textContent = 'Could not load metrics: ' + e.message;
                  }
                }

                function renderDashboard(data) {
                  // Last updated
                  const dt = new Date(data.generated_at);
                  document.getElementById('lastUpdated').textContent =
                    dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
                    ' · ' + dt.toLocaleDateString([], { month: 'short', day: 'numeric' });

                  // KR1 (live)
                  const kr1 = data.kr1;
                  const kr1val = kr1.value ?? 0;
                  document.getElementById('kr1pct').textContent = kr1.value !== null ? kr1val + '%' : '—';
                  document.getElementById('kr1num').textContent = kr1.numerator ?? '—';
                  document.getElementById('kr1den').textContent = kr1.denominator ?? '—';

                  const kr1OnTrack = kr1val >= kr1.target;
                  const kr1card = document.getElementById('kr1card');
                  kr1card.classList.remove('live', 'pending', 'warn');
                  kr1card.classList.add(kr1.value === null ? 'pending' : (kr1OnTrack ? 'live' : 'warn'));
                  document.getElementById('kr1badge').textContent = kr1.value === null ? 'No Data' : (kr1OnTrack ? '✓ On Track' : 'Below Target');
                  document.getElementById('kr1badge').className = 'kr-badge ' + (kr1.value === null ? 'badge-pending' : (kr1OnTrack ? 'badge-live' : 'badge-warn'));

                  // KR2
                  const kr2 = data.kr2;
                  document.getElementById('kr2pct').textContent = kr2.value !== null ? kr2.value + '%' : '—';
                  document.getElementById('kr2num').textContent = kr2.numerator ?? '—';
                  document.getElementById('kr2den').textContent = kr2.denominator ?? '—';

                  const kr2OnTrack = kr2.value >= kr2.target;
                  const kr2card = document.getElementById('kr2card');
                  if (!kr2OnTrack) { kr2card.classList.remove('live'); kr2card.classList.add('warn'); }
                  document.getElementById('kr2badge').textContent = kr2OnTrack ? '✓ On Track' : 'Below Target';
                  document.getElementById('kr2badge').className = 'kr-badge ' + (kr2OnTrack ? 'badge-live' : 'badge-warn');

                  // KR3
                  const kr3 = data.kr3;
                  const kr3val = kr3.value ?? 0;
                  document.getElementById('kr3pct').textContent = kr3val > 0 ? '+' + kr3val + '%' : (kr3val === 0 ? '—' : kr3val + '%');
                  document.getElementById('kr3users').textContent = kr3.users_with_data ?? '—';
                  if (kr3.message) document.getElementById('kr3msg').textContent = kr3.message;

                  const kr3OnTrack = kr3val >= kr3.target;
                  const kr3card = document.getElementById('kr3card');
                  if (kr3.status === 'insufficient_data') {
                    kr3card.classList.remove('live'); kr3card.classList.add('pending');
                    document.getElementById('kr3badge').textContent = 'Insufficient Data';
                    document.getElementById('kr3badge').className = 'kr-badge badge-pending';
                  } else if (!kr3OnTrack) {
                    kr3card.classList.remove('live'); kr3card.classList.add('warn');
                    document.getElementById('kr3badge').textContent = 'Below Target';
                    document.getElementById('kr3badge').className = 'kr-badge badge-warn';
                  } else {
                    document.getElementById('kr3badge').textContent = '✓ On Track';
                  }

                  // Summary
                  const s = data.summary;
                  document.getElementById('statTotalUsers').textContent = s.total_users ?? '—';
                  document.getElementById('statMoodEntries').textContent = (s.total_mood_entries ?? 0).toLocaleString();
                  document.getElementById('statAvgEntries').textContent = s.avg_mood_entries_per_user ?? '—';
                  document.getElementById('statActiveUsers').textContent = s.users_with_any_mood_data ?? '—';

                  // Destroy existing charts before re-rendering
                  [trendChart, distChart].forEach(c => c?.destroy());

                  // Trend + distribution charts
                  trendChart = buildTrendChart(data.weekly_mood_trend || []);
                  distChart  = buildDistChart(data.mood_distribution || []);

                  // Show dashboard
                  document.getElementById('stateLoading').classList.add('hidden');
                  document.getElementById('dashContent').classList.remove('hidden');
                }

                // Auto-refresh every 60 seconds
                loadMetrics();
                setInterval(loadMetrics, 60_000);
              </script>
            </body>
            </html>
            """;
    }
}

import { useNavigate } from 'react-router-dom';

/**
 * Shared Calendar ↔ Insights switcher with tab semantics for accessibility.
 */
export default function CalendarInsightsTabStrip({ activeTab }) {
    const navigate = useNavigate();
    const calendarSelected = activeTab === 'calendar';

    return (
        <div
            role="tablist"
            aria-label="Calendar and insights"
            className="flex gap-2 p-1 bg-[#E8E4F3]/50 rounded-2xl"
        >
            <button
                type="button"
                role="tab"
                id="tab-calendar-view"
                aria-selected={calendarSelected}
                aria-controls="calendar-insights-panel"
                onClick={() => navigate('/calendar')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    calendarSelected
                        ? 'bg-white text-[#4A4458] shadow-sm'
                        : 'text-[#5A4B70]'
                }`}
            >
                Calendar
            </button>

            <button
                type="button"
                role="tab"
                id="tab-insights-view"
                aria-selected={!calendarSelected}
                aria-controls="calendar-insights-panel"
                onClick={() => navigate('/insights')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'insights'
                        ? 'bg-white text-[#4A4458] shadow-sm'
                        : 'text-[#5A4B70]'
                }`}
            >
                Insights
            </button>
        </div>
    );
}

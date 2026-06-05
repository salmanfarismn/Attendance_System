import { useState, useEffect, useCallback } from 'react';
import { attendanceAPI } from '../../api';
import { useSemester } from '../../context/SemesterContext';
import Spinner from '../../components/Spinner';
import { ChevronLeft, ChevronRight, Activity, CalendarDays } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, addDays, isSameMonth, isSameDay, getMonth, getYear } from 'date-fns';
import Modal from '../../components/Modal';

// SaaS / GitHub style heat map colors
const HEATMAP_COLORS = {
  absent:  'var(--status-danger)', // Red
  mixed:   'var(--status-warning)', // Amber
  present: 'var(--status-excellent)', // Emerald
  half:    'var(--status-warning)', // Amber
};

const getIntensity = (records) => {
  if (!records || !records.length) return 0;
  // Calculate a ratio of present vs absent/total
  const attended = records.filter(r => r.status.includes('present')).length;
  const total = records.length;
  return attended / total;
};

export default function CalendarPage() {
  const { activeSemester } = useSemester();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedRecords, setSelectedRecords] = useState([]);

  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        month: getMonth(currentDate) + 1,
        year: getYear(currentDate),
      };
      if (activeSemester) params.semesterId = activeSemester._id;
      const res = await attendanceAPI.getCalendar(params);
      setCalendarData(res.data.data);
    } catch {}
    finally { setLoading(false); }
  }, [currentDate, activeSemester]);

  useEffect(() => { fetchCalendar(); }, [fetchCalendar]);

  const prevMonth = () => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const getDaySummary = (dateKey) => {
    const records = calendarData[dateKey] || [];
    if (!records.length) return null;
    const hasAbsent = records.some((r) => r.status.includes('absent'));
    const hasPresent = records.some((r) => r.status.includes('present'));
    if (hasAbsent && !hasPresent) return 'absent';
    if (hasPresent && !hasAbsent) return 'present';
    return 'mixed'; // includes half days or a mix of absent/present
  };

  const handleDayClick = (dateKey) => {
    const records = calendarData[dateKey];
    if (!records?.length) return;
    setSelectedDate(dateKey);
    setSelectedRecords(records);
  };

  // Build calendar grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const days = [];
  let d = calStart;
  while (d <= monthEnd || days.length % 7 !== 0) {
    days.push(d);
    d = addDays(d, 1);
    if (days.length > 42) break;
  }

  const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Activity Heatmap</h1>
          <p className="page-subtitle">Track your daily attendance patterns</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
        {/* Header & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity size={20} color="var(--brand-500)" />
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
              {format(currentDate, 'MMMM yyyy')}
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={prevMonth} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.4rem', cursor: 'pointer', color: 'var(--text-secondary)' }} className="hover:bg-white/5 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <button onClick={nextMonth} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.4rem', cursor: 'pointer', color: 'var(--text-secondary)' }} className="hover:bg-white/5 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {loading ? <Spinner center /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAYS.map((w, i) => (
                <div key={i} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{w}</div>
              ))}
            </div>

            {/* Heatmap Grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const summary = getDaySummary(dateKey);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, new Date());
                const records = calendarData[dateKey];
                const hasData = !!records?.length;
                
                let baseColor = 'var(--bg-elevated)';
                let opacity = 1;
                
                if (summary) {
                  baseColor = HEATMAP_COLORS[summary];
                  if (summary === 'present') {
                    // Adjust opacity based on intensity (number of classes attended)
                    const intensity = getIntensity(records);
                    opacity = 0.4 + (intensity * 0.6); // Scale between 40% and 100%
                  }
                }

                if (!isCurrentMonth) opacity *= 0.3;

                return (
                  <div
                    key={dateKey}
                    onClick={() => handleDayClick(dateKey)}
                    title={hasData ? `${format(day, 'MMM d')}: ${records.length} records` : format(day, 'MMM d')}
                    style={{
                      aspectRatio: '1', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: hasData ? 'pointer' : 'default',
                      background: baseColor,
                      opacity: opacity,
                      border: isToday ? '2px solid var(--text-primary)' : '1px solid rgba(255,255,255,0.05)',
                      transition: 'transform 0.1s ease',
                      position: 'relative'
                    }}
                    className={hasData ? "hover:scale-110 hover:z-10 shadow-lg" : ""}
                  >
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 600,
                      color: summary ? '#fff' : 'var(--text-muted)',
                      textShadow: summary ? '0 1px 2px rgba(0,0,0,0.5)' : 'none',
                      opacity: isCurrentMonth ? 1 : 0
                    }}>
                      {format(day, 'd')}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Less</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--bg-elevated)' }} />
                <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--status-excellent)', opacity: 0.4 }} />
                <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--status-excellent)', opacity: 0.7 }} />
                <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--status-excellent)', opacity: 1 }} />
              </div>
              <span>More</span>
              <div style={{ display: 'flex', gap: '4px', marginLeft: '1rem' }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--status-danger)' }} title="Absent" />
                <span style={{ marginLeft: '4px' }}>Absent</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Day Detail Modal */}
      <Modal open={!!selectedDate} onClose={() => setSelectedDate(null)} title={selectedDate ? format(new Date(selectedDate), 'EEEE, MMMM d, yyyy') : ''}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {selectedRecords.map((r, i) => {
            const isPresent = r.status.includes('present');
            const color = isPresent ? 'var(--status-excellent)' : 'var(--status-danger)';
            const bg = isPresent ? 'rgba(52, 211, 153, 0.1)' : 'rgba(251, 113, 133, 0.1)';
            
            return (
              <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <CalendarDays size={16} color="var(--brand-500)" />
                    {r.subjectId?.name || 'Daily Record'}
                  </div>
                  {r.note && <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{r.note}</div>}
                  {r.leaveType && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Leave: {r.leaveType}</div>}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '0.05em', background: bg, padding: '0.3rem 0.75rem', borderRadius: '6px' }}>
                  {r.status.replace(/-/g, ' ')}
                </span>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}

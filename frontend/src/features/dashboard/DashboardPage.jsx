import { useState, useEffect, useCallback } from 'react';
import { attendanceAPI } from '../../api';
import { useSemester } from '../../context/SemesterContext';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/Spinner';
import {
  CheckCircle2, XCircle, Target, ShieldCheck, Flame, Info, TrendingUp, Zap
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// --- Circular Health Ring Component ---
const HealthRing = ({ percentage, target, size = 120, strokeWidth = 10 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(percentage || 0, 100) / 100) * circumference;
  
  let color = 'var(--status-danger)';
  if (percentage >= 90) color = 'var(--status-excellent)';
  else if (percentage >= 80) color = 'var(--status-good)';
  else if (percentage >= target) color = 'var(--status-warning)';

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="var(--bg-elevated)" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.3s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{percentage || 0}%</div>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>Health</div>
      </div>
    </div>
  );
};

// --- Custom Recharts Tooltip ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'rgba(20, 20, 32, 0.9)', backdropFilter: 'blur(8px)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.75rem 1rem', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
        <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{label}</div>
        {payload.map((p) => (
          <div key={p.name} style={{ fontSize: '0.875rem', color: p.color || 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color || 'var(--brand-500)' }} />
            {p.name}: <b style={{ marginLeft: 'auto' }}>{p.value}{p.name.includes('%') ? '%' : ''}</b>
          </div>
        ))}
      </div>
    );
  }
  return null;
};


export default function DashboardPage() {
  const { user } = useAuth();
  const { activeSemester } = useSemester();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const params = activeSemester ? { semesterId: activeSemester._id } : {};
      const res = await attendanceAPI.getStats(params);
      setStats(res.data.data);
    } catch {}
    finally { setLoading(false); }
  }, [activeSemester]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) return <Spinner center />;

  const s = stats || {};
  const monthlyData = (s.monthlyTrend || []).map((m) => ({
    month: m.month, 'Attendance %': m.percentage, Present: m.attended, Total: m.total,
  }));
  const subjectData = (s.subjectStats || []).map((sub) => ({
    name: sub.subject?.name || sub.name || 'Unknown', '%': sub.percentage,
  }));

  const healthColor = s.percentage >= 90 ? 'var(--status-excellent)' : s.percentage >= 80 ? 'var(--status-good)' : s.percentage >= (s.target || 75) ? 'var(--status-warning)' : 'var(--status-danger)';

  return (
    <div className="animate-fade-in-up">
      {/* SaaS Hero Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Overview</h1>
        <p className="page-subtitle" style={{ fontSize: '0.9375rem' }}>
          Welcome back, {user?.name?.split(' ')[0]}. Here's your attendance pulse for {activeSemester ? activeSemester.name : 'all time'}.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 mb-6">
        
        {/* Main Hero Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '2rem', background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(167,139,250,0.05) 100%)', border: '1px solid rgba(167,139,250,0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: `${healthColor}20`, color: healthColor, padding: '0.35rem 0.875rem', borderRadius: 999, fontSize: '0.8125rem', fontWeight: 600, marginBottom: '1.5rem', border: `1px solid ${healthColor}40` }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: healthColor, boxShadow: `0 0 8px ${healthColor}` }} />
                {s.health ? s.health.toUpperCase() : 'UNKNOWN'}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', fontWeight: 700, lineHeight: 1, letterSpacing: '-0.03em', color: 'var(--text-primary)', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                {s.percentage || 0}<span style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>%</span>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.5rem', fontWeight: 500 }}>
                Target: <span style={{ color: 'var(--text-primary)' }}>{s.target || 75}%</span>
              </div>
            </div>

            <HealthRing percentage={s.percentage} target={s.target || 75} size={140} strokeWidth={12} />
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              <TrendingUp size={16} color="var(--brand-400)" />
              {s.percentage >= (s.target || 75) 
                ? `You can safely miss ${s.canMiss || 0} more classes and stay on target.`
                : `You need to attend ${s.needed || 0} classes without absence to recover.`}
            </p>
          </div>
        </div>

        {/* Forecast / Smart Insights Widget */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Zap size={18} color="var(--brand-400)" />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 600 }}>Smart Insights</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
            {(s.insights || []).length > 0 ? (
              s.insights.map((ins, i) => {
                const colors = { danger: '#FB7185', warning: '#FBBF24', success: '#34D399', info: '#A78BFA' };
                const c = colors[ins.type] || '#A78BFA';
                return (
                  <div key={i} style={{
                    background: `${c}10`, border: `1px solid ${c}20`,
                    borderRadius: 8, padding: '0.875rem',
                    fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.5,
                  }}>
                    {ins.message}
                  </div>
                );
              })
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>
                Mark more attendance to unlock AI forecasts.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="stat-card">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={14} color="var(--status-excellent)" /> Present Days
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{s.attended || 0}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>out of {s.total || 0} total</div>
        </div>
        
        <div className="stat-card">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <XCircle size={14} color="var(--status-danger)" /> Absent Days
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{s.absent || 0}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>missed classes</div>
        </div>

        <div className="stat-card">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={14} color="var(--status-good)" /> Safe Margin
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{s.buffer || 0}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>classes you can miss</div>
        </div>

        <div className="stat-card">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Flame size={14} color="var(--brand-400)" /> Recovery Goal
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{s.needed || 0}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>classes to hit {s.target || 75}%</div>
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="card">
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.125rem', marginBottom: '1.5rem' }}>Monthly Performance</h2>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                <Line type="monotone" dataKey="Attendance %" stroke="var(--brand-500)" strokeWidth={3} dot={{ fill: 'var(--bg-surface)', stroke: 'var(--brand-500)', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: 'var(--brand-400)', stroke: 'var(--brand-400)' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Not enough data</div>
          )}
        </div>

        {/* Subject Risk Radar (Bar Chart for now) */}
        <div className="card">
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.125rem', marginBottom: '1.5rem' }}>Subject Tracking</h2>
          {subjectData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={subjectData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="%" fill="var(--bg-elevated)" radius={[4, 4, 4, 4]}>
                  {subjectData.map((entry, index) => {
                    const color = entry['%'] >= (s.target || 75) ? 'rgba(255,255,255,0.15)' : 'var(--status-danger)';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No subject data</div>
          )}
        </div>
      </div>
    </div>
  );
}

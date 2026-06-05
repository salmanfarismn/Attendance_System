import { useState, useEffect, useCallback, useRef } from 'react';
import { attendanceAPI } from '../../api';
import { useSemester } from '../../context/SemesterContext';
import Spinner from '../../components/Spinner';
import { FileDown, Printer, BarChart2, PieChart as PieChartIcon } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar
} from 'recharts';
import toast from 'react-hot-toast';

const PIE_COLORS = ['var(--brand-500)', 'var(--bg-elevated)'];
const pctColor = (p) => p >= 90 ? 'var(--status-excellent)' : p >= 80 ? 'var(--status-good)' : p >= 75 ? 'var(--status-warning)' : 'var(--status-danger)';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'rgba(20, 20, 32, 0.9)', backdropFilter: 'blur(8px)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.75rem 1rem', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
        {label && <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{label}</div>}
        {payload.map((p) => (
          <div key={p.name} style={{ fontSize: '0.875rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color || 'var(--brand-500)' }} />
            {p.name}: <b style={{ marginLeft: 'auto' }}>{p.value}{p.name.includes('%') ? '%' : ''}</b>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ReportsPage() {
  const { activeSemester } = useSemester();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = activeSemester ? { semesterId: activeSemester._id } : {};
      const res = await attendanceAPI.getStats(params);
      setStats(res.data.data);
    } catch {}
    finally { setLoading(false); }
  }, [activeSemester]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExportJSON = async () => {
    try {
      const params = { format: 'json' };
      if (activeSemester) params.semesterId = activeSemester._id;
      const res = await attendanceAPI.export(params);
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'attendance.json'; a.click();
      toast.success('Exported JSON');
    } catch { toast.error('Export failed'); }
  };

  const handleExportCSV = async () => {
    try {
      const params = { format: 'csv' };
      if (activeSemester) params.semesterId = activeSemester._id;
      const res = await attendanceAPI.export(params);
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'attendance.csv'; a.click();
      toast.success('Exported CSV');
    } catch { toast.error('Export failed'); }
  };

  const handlePrint = () => window.print();

  if (loading) return <Spinner center />;

  const s = stats || {};
  const pieData = [{ name: 'Present', value: s.attended || 0, color: 'var(--brand-500)' }, { name: 'Absent', value: s.absent || 0, color: 'var(--text-muted)' }];
  const monthlyData = (s.monthlyTrend || []).map((m) => ({ month: m.month, '%': m.percentage }));
  const subjectData = (s.subjectStats || []).map((sub) => ({ name: sub.subject?.name || sub.name || '?', '%': sub.percentage }));

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics & Reports</h1>
          <p className="page-subtitle">Deep dive into your attendance metrics and export data.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={handleExportCSV}><FileDown size={14} /> CSV</button>
          <button className="btn-secondary" onClick={handleExportJSON}><FileDown size={14} /> JSON</button>
          <button className="btn-primary" onClick={handlePrint}><Printer size={14} /> Print Report</button>
        </div>
      </div>

      <div ref={reportRef}>
        {/* KPI Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          {[
            ['Total Classes', s.total ?? 0, 'var(--text-primary)'],
            ['Attended', s.attended ?? 0, 'var(--status-excellent)'],
            ['Absent', s.absent ?? 0, 'var(--status-danger)'],
            ['Overall Percentage', `${s.percentage ?? 0}%`, pctColor(s.percentage || 0)],
            ['Safe Buffer', s.buffer ?? 0, 'var(--status-good)'],
          ].map(([l, v, c]) => (
            <div key={l} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{l}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: c, fontFamily: 'var(--font-display)' }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 mb-6">
          {/* Donut Chart */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <PieChartIcon size={18} color="var(--brand-500)" />
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.125rem' }}>Distribution</h2>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem' }}>
              {pieData.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                  {d.name}: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Trend Line Chart */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <BarChart2 size={18} color="var(--brand-500)" />
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.125rem' }}>Monthly Trajectory</h2>
            </div>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                  <Line type="monotone" dataKey="%" stroke="var(--brand-500)" strokeWidth={3} dot={{ fill: 'var(--bg-surface)', stroke: 'var(--brand-500)', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: 'var(--brand-400)', stroke: 'var(--brand-400)' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Not enough data</div>
            )}
          </div>
        </div>

        {/* Subject Comparison */}
        {subjectData.length > 0 && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.125rem', marginBottom: '1.5rem' }}>Subject Comparison</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={subjectData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="%" fill="var(--bg-elevated)" radius={[4, 4, 0, 0]}>
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry['%'] >= (s.target || 75) ? 'rgba(255,255,255,0.15)' : 'var(--status-danger)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Breakdown Table */}
        {subjectData.length > 0 && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.125rem' }}>Detailed Breakdown</h2>
            </div>
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table style={{ minWidth: '700px' }}>
                <thead>
                  <tr>
                    <th style={{ paddingLeft: '1.5rem' }}>Subject</th>
                    <th>Conducted</th>
                    <th>Attended</th>
                    <th>Missed</th>
                    <th>Attendance</th>
                    <th style={{ paddingRight: '1.5rem', textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(s.subjectStats || []).map((sub) => {
                    const pct = sub.percentage;
                    const c = pctColor(pct);
                    return (
                      <tr key={sub.subject?._id} className="hover:bg-white/5">
                        <td style={{ paddingLeft: '1.5rem', fontWeight: 500 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: sub.subject?.color || 'var(--brand-500)' }} />
                            {sub.subject?.name || sub.name}
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{sub.total}</td>
                        <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{sub.attended}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{parseFloat((sub.total - sub.attended).toFixed(1))}</td>
                        <td><span style={{ fontWeight: 600, color: c }}>{pct}%</span></td>
                        <td style={{ paddingRight: '1.5rem', textAlign: 'right' }}>
                          <span style={{ display: 'inline-flex', background: `${c}15`, color: c, padding: '0.25rem 0.75rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            {pct >= 90 ? 'Excellent' : pct >= 80 ? 'Good' : pct >= 75 ? 'Warning' : 'Danger'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

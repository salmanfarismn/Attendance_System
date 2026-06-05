import { Sun, Menu, Search, Command } from 'lucide-react';
import { useSemester } from '../context/SemesterContext';

export default function Topbar({ setMobileOpen }) {
  const { semesters, activeSemester, setActiveSemester } = useSemester();

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
        <button
          onClick={() => setMobileOpen((o) => !o)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: '0.3rem' }}
          className="md:hidden"
        >
          <Menu size={22} />
        </button>

        {/* Search Mock (UI Shell for Command Palette) */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: '8px', padding: '0.4rem 0.75rem', width: '100%', maxWidth: '300px',
          color: 'var(--text-muted)'
        }} className="hidden sm:flex cursor-text hover:border-white/20 transition-colors">
          <Search size={14} />
          <span style={{ fontSize: '0.8125rem', flex: 1 }}>Search or jump to...</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', opacity: 0.7 }}>
            <Command size={12} />
            <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>K</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Semester Selector */}
        {semesters.length > 0 && (
          <select
            value={activeSemester?._id || ''}
            onChange={(e) => {
              if (e.target.value === '') {
                setActiveSemester(null);
              } else {
                const sem = semesters.find((s) => s._id === e.target.value);
                setActiveSemester(sem);
              }
            }}
            className="input"
            style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.8125rem', background: 'transparent' }}
          >
            <option value="">All Semesters / Global</option>
            {semesters.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        )}
      </div>
    </header>
  );
}

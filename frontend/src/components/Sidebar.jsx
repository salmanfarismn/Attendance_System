import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, CalendarDays, Calculator,
  FileBarChart2, Settings, Bell, LogOut, GraduationCap, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { notificationAPI } from '../api';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/attendance', icon: CalendarDays, label: 'Attendance' },
  { to: '/subjects', icon: BookOpen, label: 'Subjects' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/calculator', icon: Calculator, label: 'Calculator' },
  { to: '/reports', icon: FileBarChart2, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    notificationAPI.getAll().then((r) => setUnread(r.data.unreadCount || 0)).catch(() => {});
    const interval = setInterval(() => {
      notificationAPI.getAll().then((r) => setUnread(r.data.unreadCount || 0)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => { await logout(); navigate('/login'); };
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-90 md:hidden" onClick={() => setMobileOpen(false)} style={{ backdropFilter: 'blur(4px)' }} />
      )}

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`} style={{ zIndex: 110 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', padding: '0 0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <GraduationCap size={18} color="#fff" />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>AttendWise</div>
          </div>
          <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} className="md:hidden">
            <X size={20} />
          </button>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1 }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              <Icon size={18} strokeWidth={2.5} />
              <span>{label}</span>
            </NavLink>
          ))}
          
          <NavLink to="/notifications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
            <div style={{ position: 'relative' }}>
              <Bell size={18} strokeWidth={2.5} />
              {unread > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  background: 'var(--status-danger)', color: '#fff',
                  fontSize: '0.65rem', fontWeight: 700,
                  width: 14, height: 14, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 0 2px var(--bg-surface)'
                }}>{unread}</span>
              )}
            </div>
            <span>Notifications</span>
          </NavLink>
        </nav>

        {/* User Profile Area */}
        <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '6px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', flexShrink: 0
            }}>{initials}</div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
            </div>
            <button onClick={handleLogout} title="Logout" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

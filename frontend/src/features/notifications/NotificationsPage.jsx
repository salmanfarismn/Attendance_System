import { useState, useEffect, useCallback } from 'react';
import { notificationAPI } from '../../api';
import Spinner from '../../components/Spinner';
import { Bell, Check, CheckCheck, Trash2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const TYPE_CONFIG = {
  critical:     { icon: AlertCircle, color: '#f43f5e',  bg: 'rgba(244,63,94,0.08)',  label: 'Critical' },
  warning:      { icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', label: 'Warning' },
  info:         { icon: Info,         color: '#6366f1',  bg: 'rgba(99,102,241,0.08)', label: 'Info' },
  'subject-risk': { icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', label: 'At Risk' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data.data);
      setUnread(res.data.unreadCount || 0);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const markRead = async (id) => {
    await notificationAPI.markRead(id);
    fetchData();
  };

  const markAll = async () => {
    await notificationAPI.markAllRead();
    toast.success('All marked as read');
    fetchData();
  };

  const deleteN = async (id) => {
    await notificationAPI.delete(id);
    fetchData();
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Notifications {unread > 0 && <span style={{ background: '#f43f5e', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 999 }}>{unread}</span>}
          </h1>
          <p className="page-subtitle">Alerts and attendance warnings</p>
        </div>
        {unread > 0 && (
          <button className="btn-secondary" onClick={markAll}><CheckCheck size={15} /> Mark All Read</button>
        )}
      </div>

      {loading ? <Spinner center /> : notifications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Bell size={48} style={{ margin: '0 auto 1rem', opacity: 0.3, color: 'var(--text-muted)' }} />
          <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No notifications yet</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Notifications appear when attendance crosses thresholds</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map((n) => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
            const Icon = cfg.icon;
            return (
              <div key={n._id} style={{
                background: n.read ? 'var(--bg-card)' : cfg.bg,
                border: `1px solid ${n.read ? 'var(--border)' : cfg.color + '30'}`,
                borderRadius: 14, padding: '1rem 1.25rem',
                display: 'flex', alignItems: 'flex-start', gap: '1rem',
                transition: 'all 0.2s ease',
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${cfg.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={cfg.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.88rem', color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)', lineHeight: 1.5, fontWeight: n.read ? 400 : 500 }}>{n.message}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ background: `${cfg.color}15`, color: cfg.color, padding: '0.1rem 0.5rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700 }}>{cfg.label}</span>
                    {format(new Date(n.createdAt), 'dd MMM yyyy, HH:mm')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                  {!n.read && (
                    <button onClick={() => markRead(n._id)} title="Mark read" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.3rem 0.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      <Check size={14} />
                    </button>
                  )}
                  <button onClick={() => deleteN(n._id)} title="Delete" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 8, padding: '0.3rem 0.5rem', cursor: 'pointer', color: '#f43f5e' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

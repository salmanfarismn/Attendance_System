const STATUS_CONFIG = {
  excellent: { label: 'Excellent', color: 'var(--status-excellent)', bg: 'rgba(16,185,129,0.12)' },
  good:      { label: 'Good',      color: 'var(--status-good)',      bg: 'rgba(6,182,212,0.12)' },
  warning:   { label: 'Warning',   color: 'var(--status-warning)',   bg: 'rgba(245,158,11,0.12)' },
  danger:    { label: 'Danger',    color: 'var(--status-danger)',    bg: 'rgba(244,63,94,0.12)' },
};

export default function HealthBadge({ status, percentage }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.warning;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
      background: cfg.bg, border: `1px solid ${cfg.color}40`,
      borderRadius: 999, padding: '0.35rem 0.9rem',
    }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, display: 'inline-block', flexShrink: 0 }} />
      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
      {percentage !== undefined && (
        <span style={{ fontSize: '0.78rem', color: cfg.color, opacity: 0.8 }}>{percentage}%</span>
      )}
    </div>
  );
}

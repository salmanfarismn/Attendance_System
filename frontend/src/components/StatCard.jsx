export default function StatCard({ label, value, sub, icon: Icon, color = '#6366f1', trend }) {
  return (
    <div className="stat-card animate-fade-in-up" style={{ '--card-color': color }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>{label}</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, fontFamily: 'var(--font-display)' }}>{value}</div>
          {sub && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>{sub}</div>}
        </div>
        {Icon && (
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: `${color}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Icon size={22} color={color} />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div className="progress-bar" style={{ flex: 1 }}>
            <div className="progress-fill" style={{ width: `${Math.min(trend, 100)}%`, background: `linear-gradient(90deg, ${color}, ${color}99)` }} />
          </div>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color }}>{trend}%</span>
        </div>
      )}
    </div>
  );
}

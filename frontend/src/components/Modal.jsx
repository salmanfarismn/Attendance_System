export default function Modal({ open, onClose, title, children, maxWidth = 520 }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box animate-fade-in-up" style={{ maxWidth }}>
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem' }}>{title}</h2>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.5rem', lineHeight: 1, padding: '0.2rem' }}
            >×</button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

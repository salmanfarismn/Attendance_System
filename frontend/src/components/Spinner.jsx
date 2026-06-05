export default function Spinner({ size = 36, center = false }) {
  if (center) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
        <div className="spinner" style={{ width: size, height: size }} />
      </div>
    );
  }
  return <div className="spinner" style={{ width: size, height: size }} />;
}

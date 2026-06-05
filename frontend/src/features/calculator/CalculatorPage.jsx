import { useState } from 'react';
import { Calculator, Target, CheckCircle2, XCircle, Minus } from 'lucide-react';

const calcPct = (a, t) => (t === 0 ? 0 : parseFloat(((a / t) * 100).toFixed(2)));
const classesNeeded = (a, t, target) => {
  const tgt = target / 100;
  if (a / t >= tgt) return 0;
  return Math.ceil((tgt * t - a) / (1 - tgt));
};
const classesCanMiss = (a, t, target) => {
  const tgt = target / 100;
  const v = Math.floor((a - tgt * t) / tgt);
  return v > 0 ? v : 0;
};
const predictPct = (a, t, pa, pm) => calcPct(a + Number(pa), t + Number(pa) + Number(pm));

const ResultCard = ({ label, value, color, icon: Icon, sub }) => (
  <div style={{ background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 14, padding: '1.25rem', textAlign: 'center' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
      <Icon size={22} color={color} />
    </div>
    <div style={{ fontSize: '2rem', fontWeight: 800, color, fontFamily: 'var(--font-display)' }}>{value}</div>
    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{label}</div>
    {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{sub}</div>}
  </div>
);

export default function CalculatorPage() {
  const [inputs, setInputs] = useState({ total: '', attended: '', target: '75' });
  const [scenario, setScenario] = useState({ plannedPresent: '', plannedAbsent: '' });
  const [result, setResult] = useState(null);

  const set = (k) => (e) => setInputs({ ...inputs, [k]: e.target.value });
  const setS = (k) => (e) => setScenario({ ...scenario, [k]: e.target.value });

  const calculate = (e) => {
    e.preventDefault();
    const t = Number(inputs.total), a = Number(inputs.attended), tgt = Number(inputs.target);
    if (isNaN(t) || isNaN(a) || t < 0 || a < 0 || a > t) return;
    const pct = calcPct(a, t);
    const needed = classesNeeded(a, t, tgt);
    const canMiss = classesCanMiss(a, t, tgt);
    const projected = scenario.plannedPresent || scenario.plannedAbsent
      ? predictPct(a, t, scenario.plannedPresent || 0, scenario.plannedAbsent || 0)
      : null;
    setResult({ pct, needed, canMiss, projected, a, t, tgt });
  };

  const health = result ? (result.pct >= 90 ? ['excellent','#10b981'] : result.pct >= 80 ? ['good','#06b6d4'] : result.pct >= result.tgt ? ['warning','#f59e0b'] : ['danger','#f43f5e']) : null;

  return (
    <div className="animate-fade-in" style={{ maxWidth: 740, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Attendance Calculator</h1>
        <p className="page-subtitle">Calculate exactly how many classes you need to attend or can skip</p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>Input Your Data</h2>
        <form onSubmit={calculate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', alignItems: 'end' }}>
          {[
            ['Total Classes', 'total', 'e.g. 80'],
            ['Attended Classes', 'attended', 'e.g. 65'],
            ['Target %', 'target', 'e.g. 75'],
          ].map(([label, key, ph]) => (
            <div key={key}>
              <label className="input-label">{label}</label>
              <input type="number" min="0" className="input" placeholder={ph} value={inputs[key]} onChange={set(key)} required />
            </div>
          ))}
          <div style={{ gridColumn: '1/-1' }}>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.75rem 0' }} />
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 600 }}>📊 Scenario Planner (optional)</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="input-label">Planned Attendances</label>
                <input type="number" min="0" className="input" placeholder="e.g. 10" value={scenario.plannedPresent} onChange={setS('plannedPresent')} />
              </div>
              <div>
                <label className="input-label">Planned Absences</label>
                <input type="number" min="0" className="input" placeholder="e.g. 3" value={scenario.plannedAbsent} onChange={setS('plannedAbsent')} />
              </div>
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ gridColumn: '1/-1', justifyContent: 'center', padding: '0.85rem' }}>
            <Calculator size={16} /> Calculate Now
          </button>
        </form>
      </div>

      {result && (
        <div className="animate-fade-in-up">
          {/* Big Percentage */}
          <div className="card" style={{ textAlign: 'center', marginBottom: '1.25rem', background: `${health[1]}10`, border: `1px solid ${health[1]}30` }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Current Attendance</div>
            <div style={{ fontSize: '4rem', fontWeight: 900, color: health[1], fontFamily: 'var(--font-display)', lineHeight: 1 }}>{result.pct}%</div>
            <div style={{ marginTop: '0.75rem' }}>
              <span style={{ background: `${health[1]}20`, color: health[1], padding: '0.3rem 1rem', borderRadius: 999, fontSize: '0.85rem', fontWeight: 700, textTransform: 'capitalize' }}>{health[0]}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', justifyContent: 'center' }}>
              <div className="progress-bar" style={{ width: 260 }}>
                <div className="progress-fill" style={{ width: `${Math.min(result.pct, 100)}%`, background: `linear-gradient(90deg, ${health[1]}, ${health[1]}88)` }} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: health[1] }}>{result.tgt}% target</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <ResultCard label="Classes to Attend" value={result.needed} color="#6366f1" icon={Target} sub={result.needed === 0 ? "You're safe!" : `to reach ${result.tgt}%`} />
            <ResultCard label="Can Skip" value={result.canMiss} color="#10b981" icon={CheckCircle2} sub="and stay above target" />
            {result.projected !== null && (
              <ResultCard label="Projected %" value={`${result.projected}%`} color="#06b6d4" icon={Calculator} sub="after your plan" />
            )}
          </div>

          {/* Smart message */}
          <div className="card" style={{ background: `${health[1]}08`, border: `1px solid ${health[1]}25` }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {result.pct < result.tgt
                ? `⚠️ Your attendance is below ${result.tgt}%. You need to attend the next ${result.needed} consecutive classes without any absence to reach the target.`
                : `✅ You are safe! You can miss up to ${result.canMiss} more class${result.canMiss !== 1 ? 'es' : ''} while staying at or above ${result.tgt}%.`}
              {result.projected !== null && ` With your planned ${scenario.plannedPresent || 0} attendances and ${scenario.plannedAbsent || 0} absences, your attendance will be ${result.projected}%.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { subjectAPI } from '../../api';
import { useSemester } from '../../context/SemesterContext';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';
import { Plus, Pencil, Trash2, BookOpen, TrendingUp, TrendingDown, AlertTriangle, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#8B5CF6','#38BDF8','#34D399','#FBBF24','#F472B6','#FB7185','#60A5FA','#A78BFA'];
const emptyForm = { name: '', facultyName: '', credits: '', color: '#8B5CF6' };

export default function SubjectsPage() {
  const { activeSemester } = useSemester();
  const [analytics, setAnalytics] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = activeSemester ? { semesterId: activeSemester._id } : {};
      const [subs, ana] = await Promise.all([
        subjectAPI.getAll(params),
        subjectAPI.getAnalytics(params),
      ]);
      setSubjects(subs.data.data);
      setAnalytics(ana.data.data);
    } catch {}
    finally { setLoading(false); }
  }, [activeSemester]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { setEditing(null); setForm({ ...emptyForm, color: COLORS[subjects.length % COLORS.length] }); setModalOpen(true); };
  const openEdit = (s) => { setEditing(s); setForm({ name: s.name, facultyName: s.facultyName || '', credits: s.credits || '', color: s.color || '#8B5CF6' }); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Subject name required');
    if (!activeSemester) return toast.error('Select a semester first');
    setSaving(true);
    try {
      const payload = { ...form, credits: Number(form.credits) || 0, semesterId: activeSemester._id };
      if (editing) { await subjectAPI.update(editing._id, payload); toast.success('Subject updated'); }
      else { await subjectAPI.create(payload); toast.success('Subject created'); }
      setModalOpen(false); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await subjectAPI.delete(deleteId); toast.success('Subject deleted'); setDeleteId(null); fetchData(); }
    catch { toast.error('Delete failed'); }
  };

  const pctColor = (pct, target = 75) => pct >= 90 ? 'var(--status-excellent)' : pct >= 80 ? 'var(--status-good)' : pct >= target ? 'var(--status-warning)' : 'var(--status-danger)';

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Subjects</h1>
          <p className="page-subtitle">Track your performance module by module</p>
        </div>
        <button className="btn-primary" onClick={openAdd}><Plus size={16} /> Add Subject</button>
      </div>

      {/* Analytics Cards */}
      {analytics && subjects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {analytics.highest && (
            <div className="stat-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(52, 211, 153, 0.1)', padding: '6px', borderRadius: '8px' }}><TrendingUp size={16} color="var(--status-excellent)" /></div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Top Performer</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--text-primary)', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{analytics.highest.subject.name}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--status-excellent)' }}>{analytics.highest.percentage}%</div>
            </div>
          )}
          {analytics.lowest && (
            <div className="stat-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(251, 113, 133, 0.1)', padding: '6px', borderRadius: '8px' }}><TrendingDown size={16} color="var(--status-danger)" /></div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Lowest Subject</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--text-primary)', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{analytics.lowest.subject.name}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--status-danger)' }}>{analytics.lowest.percentage}%</div>
            </div>
          )}
          <div className="stat-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ background: 'rgba(251, 191, 36, 0.1)', padding: '6px', borderRadius: '8px' }}><AlertTriangle size={16} color="var(--status-warning)" /></div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>At Risk Subjects</span>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--status-warning)', lineHeight: 1, marginBottom: '0.25rem' }}>{analytics.atRisk?.length || 0}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>falling below target</div>
          </div>
        </div>
      )}

      {/* Subjects Grid */}
      {loading ? <Spinner center /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {subjects.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '6rem 2rem', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
              <BookOpen size={48} strokeWidth={1} style={{ margin: '0 auto 1.5rem', opacity: 0.3 }} />
              <p style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--text-primary)' }}>No subjects yet</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>Add your first subject to unlock granular attendance tracking.</p>
              <button className="btn-primary" onClick={openAdd}><Plus size={16} /> Add Subject</button>
            </div>
          )}
          {(analytics?.analytics || []).map(({ subject, total, attended, percentage }) => {
            const color = pctColor(percentage);
            const isRisk = percentage < 75;
            
            return (
              <div key={subject._id} className="card" style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: subject.color || 'var(--brand-500)' }} />
                
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <h3 style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--text-primary)' }}>{subject.name}</h3>
                      {isRisk && <span title="Below Target" style={{ display: 'flex', color: 'var(--status-danger)' }}><AlertTriangle size={14} /></span>}
                    </div>
                    {subject.facultyName && <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{subject.facultyName}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button onClick={() => openEdit(subject)} title="Edit" style={{ background: 'transparent', border: 'none', padding: '0.4rem', cursor: 'pointer', color: 'var(--text-muted)', borderRadius: '6px' }} className="hover:bg-white/5 hover:text-white transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => setDeleteId(subject._id)} title="Delete" style={{ background: 'transparent', border: 'none', padding: '0.4rem', cursor: 'pointer', color: 'var(--text-muted)', borderRadius: '6px' }} className="hover:bg-red-500/10 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[['Conducted', total], ['Attended', attended], ['Missed', parseFloat((total - attended).toFixed(1))]].map(([l, v]) => (
                    <div key={l} style={{ background: 'var(--bg-elevated)', borderRadius: '8px', padding: '0.75rem', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{l}</div>
                      <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{v}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Health</span>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color }}>{percentage}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min(percentage, 100)}%`, background: color }} />
                  </div>
                  {subject.credits > 0 && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Zap size={12} /> {subject.credits} Credits</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal - Add/Edit */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Subject' : 'Add Subject'}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label className="input-label">Subject Name *</label>
            <input className="input" placeholder="e.g. Data Structures" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="input-label">Faculty Name</label>
            <input className="input" placeholder="Dr. Smith" value={form.facultyName} onChange={(e) => setForm({ ...form, facultyName: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Credits</label>
              <input type="number" min="0" max="10" className="input" placeholder="4" value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })} />
            </div>
            <div>
              <label className="input-label">Color Theme</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                {COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setForm({ ...form, color: c })} style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer', outline: form.color === c ? `2px solid ${c}` : 'none', outlineOffset: '2px', opacity: form.color === c ? 1 : 0.6 }} className="hover:opacity-100 transition-all" />
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update Subject' : 'Create Subject'}</button>
          </div>
        </form>
      </Modal>

      {/* Modal - Delete */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Subject">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem', lineHeight: 1.6 }}>
          Are you sure you want to delete this subject? All associated attendance records will be permanently removed.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
          <button className="btn-danger" onClick={handleDelete}>Delete Subject</button>
        </div>
      </Modal>
    </div>
  );
}

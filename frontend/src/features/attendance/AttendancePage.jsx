import { useState, useEffect, useCallback } from 'react';
import { attendanceAPI, subjectAPI } from '../../api';
import { useSemester } from '../../context/SemesterContext';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';
import { Plus, Pencil, Trash2, CheckCircle2, XCircle, Clock, BookOpen, CalendarPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_OPTS = [
  { value: 'present',                label: 'Present', color: 'var(--status-excellent)' },
  { value: 'absent',                 label: 'Absent',  color: 'var(--status-danger)' },
  { value: 'half-morning-present',   label: 'Half Day (Morning)', color: 'var(--status-warning)' },
  { value: 'half-afternoon-present', label: 'Half Day (Afternoon)', color: 'var(--status-warning)' },
];

const LEAVE_OPTS = [
  { value: '',         label: 'None' },
  { value: 'sick',     label: 'Sick Leave' },
  { value: 'on-duty',  label: 'On Duty' },
  { value: 'personal', label: 'Personal' },
  { value: 'other',    label: 'Other' },
];

const emptyForm = {
  subjectId: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  status: 'present',
  leaveType: '',
  note: '',
};

export default function AttendancePage() {
  const { activeSemester } = useSemester();
  const [records,    setRecords]    = useState([]);
  const [subjects,   setSubjects]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [deleteId,   setDeleteId]   = useState(null);
  const [form,       setForm]       = useState(emptyForm);
  const [filters,    setFilters]    = useState({ subjectId: '', month: '', year: '' });
  const [saving,     setSaving]     = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeSemester)      params.semesterId = activeSemester._id;
      if (filters.subjectId)   params.subjectId  = filters.subjectId;
      if (filters.month)       params.month      = filters.month;
      if (filters.year)        params.year       = filters.year;

      const [recs, subs] = await Promise.all([
        attendanceAPI.getAll(params),
        subjectAPI.getAll(activeSemester ? { semesterId: activeSemester._id } : {}),
      ]);
      setRecords(recs.data.data);
      setSubjects(subs.data.data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  }, [activeSemester, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd  = () => { setEditing(null);  setForm(emptyForm); setModalOpen(true); };
  const openEdit = (r) => {
    setEditing(r);
    setForm({
      subjectId: r.subjectId?._id || r.subjectId || '',
      date:      format(new Date(r.date), 'yyyy-MM-dd'),
      status:    r.status,
      leaveType: r.leaveType || '',
      note:      r.note || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, subjectId: form.subjectId || null, semesterId: activeSemester?._id || null };
      if (editing) {
        await attendanceAPI.update(editing._id, payload);
        toast.success('Attendance updated');
      } else {
        await attendanceAPI.add(payload);
        toast.success('Attendance marked successfully');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving attendance');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await attendanceAPI.delete(deleteId);
      toast.success('Record deleted');
      setDeleteId(null);
      fetchData();
    } catch { toast.error('Delete failed'); }
  };

  const getStatusDisplay = (status) => {
    if (status === 'present') return { icon: <CheckCircle2 size={16} />, color: 'var(--status-excellent)', bg: 'rgba(52, 211, 153, 0.1)' };
    if (status === 'absent')  return { icon: <XCircle size={16} />, color: 'var(--status-danger)', bg: 'rgba(251, 113, 133, 0.1)' };
    return { icon: <Clock size={16} />, color: 'var(--status-warning)', bg: 'rgba(251, 191, 36, 0.1)' };
  };

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance Log</h1>
          <p className="page-subtitle">Record and manage your daily or subject-wise classes</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={16} /> Mark Attendance
        </button>
      </div>

      {/* Filters Area */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', padding: '1.25rem', background: 'var(--bg-card)' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label className="input-label">Filter by Subject</label>
          <select className="input" value={filters.subjectId} onChange={(e) => setFilters({ ...filters, subjectId: e.target.value })}>
            <option value="">All Records</option>
            <option value="none">Daily (No Subject)</option>
            {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>
        <div style={{ flex: '1 1 140px' }}>
          <label className="input-label">Month</label>
          <select className="input" value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })}>
            <option value="">All Months</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'short' })}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: '1 1 120px' }}>
          <label className="input-label">Year</label>
          <input className="input" type="number" placeholder={new Date().getFullYear()} value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })} />
        </div>
        <button className="btn-secondary" onClick={() => setFilters({ subjectId: '', month: '', year: '' })}>Clear Filters</button>
      </div>

      {/* List / Table */}
      {loading ? <Spinner center /> : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {records.length === 0 ? (
            <div style={{ padding: '6rem 2rem', textAlign: 'center' }}>
              <CalendarPlus size={48} strokeWidth={1} style={{ margin: '0 auto 1.5rem', opacity: 0.3, color: 'var(--text-muted)' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No records found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Start building your attendance history by marking your first class.</p>
              <button className="btn-primary" onClick={openAdd}><Plus size={16} /> Mark Attendance</button>
            </div>
          ) : (
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table style={{ minWidth: '800px' }}>
                <thead>
                  <tr>
                    <th style={{ paddingLeft: '1.5rem' }}>Date</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Leave / Note</th>
                    <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => {
                    const statusUI = getStatusDisplay(r.status);
                    return (
                      <tr key={r._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s ease' }} className="hover:bg-white/5">
                        <td style={{ paddingLeft: '1.5rem', fontWeight: 500 }}>
                          {format(new Date(r.date), 'MMM dd, yyyy')}
                        </td>
                        <td>
                          {r.subjectId ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ width: 8, height: 8, borderRadius: '50%', background: r.subjectId.color || 'var(--brand-500)', flexShrink: 0 }} />
                              <span style={{ fontWeight: 500 }}>{r.subjectId.name}</span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
                              <BookOpen size={14} /> Daily Record
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: statusUI.bg, color: statusUI.color, padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {statusUI.icon}
                            {r.status.replace(/-/g, ' ').toUpperCase()}
                          </div>
                        </td>
                        <td>
                          {r.leaveType && <span style={{ fontSize: '0.75rem', background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '0.2rem 0.5rem', borderRadius: '4px', marginRight: '0.5rem', color: 'var(--text-secondary)' }}>{r.leaveType}</span>}
                          {r.note && <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{r.note}</span>}
                          {!r.leaveType && !r.note && <span style={{ color: 'var(--text-muted)', opacity: 0.5 }}>—</span>}
                        </td>
                        <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                          <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => openEdit(r)} title="Edit" style={{ background: 'transparent', border: 'none', padding: '0.4rem', cursor: 'pointer', color: 'var(--text-muted)', borderRadius: '6px' }} className="hover:bg-white/5 hover:text-white transition-colors"><Pencil size={15} /></button>
                            <button onClick={() => setDeleteId(r._id)} title="Delete" style={{ background: 'transparent', border: 'none', padding: '0.4rem', cursor: 'pointer', color: 'var(--text-muted)', borderRadius: '6px' }} className="hover:bg-red-500/10 hover:text-red-400 transition-colors"><Trash2 size={15} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Record' : 'Mark Attendance'}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label className="input-label">Date</label>
              <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div style={{ flex: 1 }}>
              <label className="input-label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="input-label">Subject <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span></label>
            <select className="input" value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })}>
              <option value="">Daily Attendance (No Subject)</option>
              {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label className="input-label">Leave Type</label>
              <select className="input" value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })}>
                {LEAVE_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div style={{ flex: 2 }}>
              <label className="input-label">Note</label>
              <input type="text" className="input" placeholder="e.g. Traffic, Medical, Event..." value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Record' : 'Save Record'}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Record">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Are you sure you want to delete this record? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
          <button className="btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}

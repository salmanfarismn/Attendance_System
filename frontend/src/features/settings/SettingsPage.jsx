import { useState, useCallback } from 'react';
import { userAPI, semesterAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useSemester } from '../../context/SemesterContext';
import { useTheme } from '../../context/ThemeContext';
import Modal from '../../components/Modal';
import { User, Lock, Moon, Sun, Plus, Trash2, CalendarDays, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { semesters, fetchSemesters } = useSemester();
  const { theme, toggleTheme, isDark } = useTheme();

  const [profile, setProfile] = useState({ name: user?.name || '', collegeName: user?.collegeName || '', department: user?.department || '', semester: user?.semester || '', attendanceTarget: user?.attendanceTarget || 75 });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [semForm, setSemForm] = useState({ name: '', startDate: '', endDate: '', isActive: false });
  const [semModal, setSemModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await userAPI.updateProfile(profile);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error('Passwords do not match');
    if (passwords.newPassword.length < 6) return toast.error('Password must be 6+ characters');
    setPwSaving(true);
    try {
      await userAPI.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setPwSaving(false); }
  };

  const handleAddSemester = async (e) => {
    e.preventDefault();
    try {
      await semesterAPI.create(semForm);
      toast.success('Semester created!');
      setSemModal(false);
      setSemForm({ name: '', startDate: '', endDate: '', isActive: false });
      fetchSemesters();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDeleteSemester = async (id) => {
    if (!confirm('Delete this semester and all its data?')) return;
    try { await semesterAPI.delete(id); toast.success('Semester deleted'); fetchSemesters(); }
    catch { toast.error('Delete failed'); }
  };

  const SectionCard = ({ title, icon: Icon, children }) => (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color="#818cf8" />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>{title}</h2>
      </div>
      {children}
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: 680, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your profile, semesters, and preferences</p>
      </div>

      {/* Profile */}
      <SectionCard title="Profile Information" icon={User}>
        <form onSubmit={handleProfileSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {[['Full Name','name','John Doe'],['College','collegeName','MIT'],['Department','department','CS'],['Semester','semester','Sem 3']].map(([l,k,ph]) => (
            <div key={k}>
              <label className="input-label">{l}</label>
              <input className="input" placeholder={ph} value={profile[k]} onChange={(e) => setProfile({ ...profile, [k]: e.target.value })} />
            </div>
          ))}
          <div style={{ gridColumn: '1/-1' }}>
            <label className="input-label">Attendance Target (%)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input type="range" min="60" max="100" step="5" value={profile.attendanceTarget} onChange={(e) => setProfile({ ...profile, attendanceTarget: Number(e.target.value) })} style={{ flex: 1 }} />
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--brand-400)', minWidth: 40 }}>{profile.attendanceTarget}%</span>
            </div>
          </div>
          <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Profile'}</button>
          </div>
        </form>
      </SectionCard>

      {/* Theme */}
      <SectionCard title="Appearance" icon={isDark ? Moon : Sun}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Theme</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Currently using {theme} mode</div>
          </div>
          <button onClick={toggleTheme} className="btn-secondary">
            {isDark ? <><Sun size={15} /> Light Mode</> : <><Moon size={15} /> Dark Mode</>}
          </button>
        </div>
      </SectionCard>

      {/* Password */}
      <SectionCard title="Change Password" icon={Lock}>
        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[['Current Password','currentPassword'],['New Password','newPassword'],['Confirm New Password','confirmPassword']].map(([l,k]) => (
            <div key={k}>
              <label className="input-label">{l}</label>
              <input type="password" className="input" placeholder="••••••••" value={passwords[k]} onChange={(e) => setPasswords({ ...passwords, [k]: e.target.value })} required />
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-primary" disabled={pwSaving}>{pwSaving ? 'Updating…' : 'Change Password'}</button>
          </div>
        </form>
      </SectionCard>

      {/* Semesters */}
      <SectionCard title="Semester Management" icon={CalendarDays}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
          {semesters.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No semesters yet.</p>}
          {semesters.map((s) => (
            <div key={s._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-elevated)', borderRadius: 10, padding: '0.75rem 1rem', border: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {s.name}
                  {s.isActive && <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: 999 }}>ACTIVE</span>}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {s.startDate ? format(new Date(s.startDate), 'MMM yyyy') : '?'} – {s.endDate ? format(new Date(s.endDate), 'MMM yyyy') : '?'}
                </div>
              </div>
              <button onClick={() => handleDeleteSemester(s._id)} style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 8, padding: '0.3rem 0.5rem', cursor: 'pointer', color: '#f43f5e' }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={() => setSemModal(true)}><Plus size={15} /> Add Semester</button>
      </SectionCard>

      {/* Add Semester Modal */}
      <Modal open={semModal} onClose={() => setSemModal(false)} title="Add Semester">
        <form onSubmit={handleAddSemester} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="input-label">Semester Name *</label>
            <input className="input" placeholder="e.g. Semester 3" value={semForm.name} onChange={(e) => setSemForm({ ...semForm, name: e.target.value })} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="input-label">Start Date *</label>
              <input type="date" className="input" value={semForm.startDate} onChange={(e) => setSemForm({ ...semForm, startDate: e.target.value })} required />
            </div>
            <div>
              <label className="input-label">End Date *</label>
              <input type="date" className="input" value={semForm.endDate} onChange={(e) => setSemForm({ ...semForm, endDate: e.target.value })} required />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="isActive" checked={semForm.isActive} onChange={(e) => setSemForm({ ...semForm, isActive: e.target.checked })} />
            <label htmlFor="isActive" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>Set as active semester</label>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={() => setSemModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Create Semester</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

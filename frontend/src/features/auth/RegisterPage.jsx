import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, User, Mail, Lock, Building2, BookOpen, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

// ✅ Field defined OUTSIDE component so React doesn't remount it on every keystroke
const Field = ({ label, name, type, icon: Icon, placeholder, value, onChange, showPw, onTogglePw, required }) => (
  <div>
    <label className="input-label">{label}</label>
    <div style={{ position: 'relative' }}>
      <Icon size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
      <input
        type={type || 'text'}
        className="input"
        placeholder={placeholder}
        style={{ paddingLeft: '2.4rem', paddingRight: name === 'password' ? '2.8rem' : undefined }}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={name === 'password' ? 'new-password' : name === 'email' ? 'email' : 'off'}
      />
      {name === 'password' && (
        <button
          type="button"
          onClick={onTogglePw}
          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  </div>
);

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', collegeName: '', department: '', semester: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', padding: '1rem',
      backgroundImage: 'radial-gradient(ellipse at 80% 50%, rgba(99,102,241,0.08) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(168,85,247,0.06) 0%, transparent 60%)'
    }}>
      <div style={{ width: '100%', maxWidth: 460 }} className="animate-fade-in-up">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', boxShadow: '0 8px 32px rgba(99,102,241,0.3)' }}>
            <GraduationCap size={26} color="#fff" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem' }} className="gradient-text">AttendWise</h1>
        </div>

        {/* Card */}
        <div className="card" style={{ borderRadius: 20, padding: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.2rem' }}>Create your account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginBottom: '1.5rem' }}>Start tracking attendance smarter</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Field label="Full Name"     name="name"       type="text"     icon={User}       placeholder="John Doe"            value={form.name}       onChange={handleChange('name')}       required />
            <Field label="Email"         name="email"      type="email"    icon={Mail}       placeholder="you@college.edu"     value={form.email}      onChange={handleChange('email')}      required />
            <Field label="Password"      name="password"   type={showPw ? 'text' : 'password'} icon={Lock} placeholder="Min. 6 characters" value={form.password} onChange={handleChange('password')} required showPw={showPw} onTogglePw={() => setShowPw((p) => !p)} />
            <Field label="College Name"  name="collegeName" type="text"    icon={Building2}  placeholder="MIT, IIT, etc."      value={form.collegeName} onChange={handleChange('collegeName')} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Field label="Department" name="department" type="text" icon={BookOpen} placeholder="Computer Science" value={form.department} onChange={handleChange('department')} />
              <Field label="Semester"   name="semester"   type="text" icon={BookOpen} placeholder="Sem 3"            value={form.semester}   onChange={handleChange('semester')} />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', marginTop: '0.25rem' }}
              disabled={loading}
            >
              {loading ? 'Creating...' : <><span>Create Account</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--brand-400)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { semesterAPI } from '../api';

const SemesterContext = createContext(null);

export const SemesterProvider = ({ children }) => {
  const [semesters, setSemesters] = useState([]);
  const [activeSemester, setActiveSemester] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSemesters = useCallback(async () => {
    // Only fetch if user is authenticated
    const token = localStorage.getItem('aw_token');
    if (!token) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await semesterAPI.getAll();
      const data = res.data.data;
      setSemesters(data);
      const active = data.find((s) => s.isActive) || data[0] || null;
      setActiveSemester(active);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSemesters(); }, [fetchSemesters]);

  return (
    <SemesterContext.Provider value={{ semesters, activeSemester, setActiveSemester, loading, fetchSemesters }}>
      {children}
    </SemesterContext.Provider>
  );
};

export const useSemester = () => {
  const ctx = useContext(SemesterContext);
  if (!ctx) throw new Error('useSemester must be used within SemesterProvider');
  return ctx;
};

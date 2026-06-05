import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="main-layout">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Topbar setMobileOpen={setMobileOpen} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

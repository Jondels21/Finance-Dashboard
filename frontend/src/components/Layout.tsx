import { Outlet } from 'react-router-dom';

function Layout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto max-w-7xl scroll-smooth p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;

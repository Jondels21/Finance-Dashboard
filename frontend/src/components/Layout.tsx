import { Outlet, useNavigate } from 'react-router-dom';

function Layout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:gap-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Finance Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              One workspace for overview, categories, and transactions.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 md:ml-auto md:justify-end">
            <a
              href="#overview"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Overview
            </a>
            <a
              href="#transactions"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Transactions
            </a>
            <a
              href="#categories"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Categories
            </a>
            <a
              href="#activity"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Recent
            </a>
            <button
              onClick={logout}
              className="rounded-full bg-rose-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl scroll-smooth p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;

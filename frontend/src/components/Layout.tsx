import { Link, Outlet, useNavigate } from 'react-router-dom';

function Layout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-slate-800 text-white px-6 py-4">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold">
            Finance Dashboard
          </h1>

          <Link to="/">Dashboard</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/transactions">Transactions</Link>

          <button
            onClick={logout}
            className="ml-auto bg-red-500 px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
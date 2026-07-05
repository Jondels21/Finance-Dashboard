import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';


function LoginPage() {

  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (
    e: React.SubmitEvent,
  ) => {
    e.preventDefault();

    try {
      const data = await login(email, password);

      localStorage.setItem('token', data.access_token);

      navigate('/');
    } catch {
      setError('Invalid Credentials');
    }
  };


  return (

    
        <div className="flex min-h-screen items-center justify-center bg-slate-100">
          <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
            <p className="mb-2 text-center text-sm text-slate-500">
              Finance Dashboard
            </p>
            <h1 className="mb-6 text-center text-3xl font-bold">
              Login
            </h1>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
              >
                Login
              </button>
            </form>
          </div>
        </div>
  );
}

export default LoginPage;
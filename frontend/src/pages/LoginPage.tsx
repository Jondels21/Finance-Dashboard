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
    <div>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <br />
          <input
            type ="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />
        </div>

        <div>
          <label>Password</label>
          <br />
          <input 
            type="password"
            value={password}
            onChange={(e) => 
              setPassword(e.target.value)
            }
          />
        </div>

        {error && <p>{error}</p>}

        <button type="submit">
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
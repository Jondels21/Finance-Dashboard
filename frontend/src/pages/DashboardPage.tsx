import {useState, useEffect} from 'react';
import {getSummary} from '../api/dashboard';
import {useNavigate} from 'react-router-dom';



interface Summary {
  income: number;
  expenses: number;
  balance: number;
}

function DashboardPage() {

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    getSummary()
      .then(setSummary)
      .catch(console.error);
  }, []);

  if (!summary) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Finance Dashboard</h1>
      <button onClick={logout}>
        Logout
      </button>

      <p>Income: ${summary.income.toFixed(2)}</p>
      <p>Expenses: ${summary.expenses.toFixed(2)}</p>
      <p>Balance: ${summary.balance.toFixed(2)}</p>
    </div>
  );
}

export default DashboardPage;
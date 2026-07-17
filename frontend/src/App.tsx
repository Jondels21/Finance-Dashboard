import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/"
            element={<DashboardPage />}
          />

          <Route
            path="/categories"
            element={<DashboardPage />}
          />

          <Route
            path="/transactions"
            element={<DashboardPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

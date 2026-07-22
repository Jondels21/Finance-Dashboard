import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SpendingOverviewPage from './pages/SpendingOverviewPage';
import CategoriesPage from './pages/CategoriesPage';

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
            element={<CategoriesPage />}
          />

          <Route
            path="/spending"
            element={<SpendingOverviewPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

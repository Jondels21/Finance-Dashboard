import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  getCategoryBreakdown,
  getMonthlySpending,
  getSummary,
} from '../api/dashboard';
import { getApiError } from '../components/ApiError';
import type {
  CategoryBreakdown,
  MonthlySpending,
  Summary,
} from '../types/dashboard';

const COLORS = [
  '#0ea5e9',
  '#14b8a6',
  '#f59e0b',
  '#f97316',
  '#8b5cf6',
  '#ef4444',
];

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'EUR',
});

function formatCurrency(amount: number) {
  return currencyFormatter.format(amount);
}

function SpendingOverviewPage() {
  const [summary, setSummary] = useState<Summary>();
  const [categoryBreakdown, setCategoryBreakdown] = useState<
    CategoryBreakdown[]
  >([]);
  const [monthlySpending, setMonthlySpending] = useState<MonthlySpending[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setError('');

    try {
      const [summaryData, breakdownData, monthlyData] = await Promise.all([
        getSummary(),
        getCategoryBreakdown(),
        getMonthlySpending(),
      ]);

      setSummary(summaryData);
      setCategoryBreakdown(breakdownData);
      setMonthlySpending(monthlyData);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  return (
    <div className="space-y-6 pb-8">
      <section className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl">
        <div className="grid gap-6 px-6 py-8 md:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.85fr)] md:px-8">
          <div className="space-y-4">
            <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-slate-200">
              Spending overview
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                See where the money is going.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                Review category concentration and monthly expense movement in a
                focused view.
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
            >
              Back to dashboard
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-300">Income</p>
              <p className="mt-1 text-2xl font-semibold">
                {formatCurrency(summary?.income ?? 0)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-300">Expenses</p>
              <p className="mt-1 text-2xl font-semibold">
                {formatCurrency(summary?.expenses ?? 0)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-300">Balance</p>
              <p
                className={`mt-1 text-2xl font-semibold ${
                  (summary?.balance ?? 0) >= 0
                    ? 'text-emerald-300'
                    : 'text-rose-300'
                }`}
              >
                {formatCurrency(summary?.balance ?? 0)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
          {error}
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Category breakdown
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Expense totals grouped by category.
            </p>
          </div>

          {isLoading ? (
            <div className="flex h-80 items-center justify-center text-sm text-slate-500">
              Loading chart...
            </div>
          ) : categoryBreakdown.length === 0 ? (
            <div className="flex h-80 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
              Add some expenses to see the breakdown.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  dataKey="total"
                  nameKey="categoryName"
                  outerRadius={112}
                  innerRadius={68}
                  paddingAngle={2}
                >
                  {categoryBreakdown.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </article>

        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Monthly spending
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Expense trend by month.
            </p>
          </div>

          {isLoading ? (
            <div className="flex h-80 items-center justify-center text-sm text-slate-500">
              Loading chart...
            </div>
          ) : monthlySpending.length === 0 ? (
            <div className="flex h-80 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
              Monthly activity will appear here once you add expenses.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={monthlySpending}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#0f172a"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </article>
      </section>
    </div>
  );
}

export default SpendingOverviewPage;

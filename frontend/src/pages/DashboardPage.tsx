import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Cell,
  CartesianGrid,
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
  getSummary,
  getCategoryBreakdown,
  getMonthlySpending,
} from '../api/dashboard';
import {
  createCategory,
  deleteCategory,
  getCategories,
} from '../api/categories';
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
} from '../api/transactions';
import { getApiError } from '../components/ApiError';
import type { Category } from '../types/category';
import type {
  CategoryBreakdown,
  MonthlySpending,
  Summary,
} from '../types/dashboard';
import type { Transaction } from '../types/transaction';

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

function formatDate(value: string) {
  return new Date(value).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function DashboardPage() {
  const [summary, setSummary] = useState<Summary>();
  const [categoryBreakdown, setCategoryBreakdown] = useState<
    CategoryBreakdown[]
  >([]);
  const [monthlySpending, setMonthlySpending] = useState<MonthlySpending[]>(
    [],
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSavingTransaction, setIsSavingTransaction] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [deletingTransactionId, setDeletingTransactionId] = useState<
    string | null
  >(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(
    null,
  );

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [transactionDate, setTransactionDate] = useState('');
  const [categoryName, setCategoryName] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setError('');

    try {
      const [
        summaryData,
        breakdownData,
        monthlyData,
        transactionData,
        categoryData,
      ] = await Promise.all([
        getSummary(),
        getCategoryBreakdown(),
        getMonthlySpending(),
        getTransactions(),
        getCategories(),
      ]);

      setSummary(summaryData);
      setCategoryBreakdown(breakdownData);
      setMonthlySpending(monthlyData);
      setTransactions(transactionData);
      setCategories(categoryData);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const recentTransactions = useMemo(() => transactions.slice(0, 6), [transactions]);

  const totals = useMemo(() => {
    const income = transactions
      .filter((transaction) => transaction.type === 'INCOME')
      .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

    const expenses = transactions
      .filter((transaction) => transaction.type === 'EXPENSE')
      .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

    return {
      income,
      expenses,
      balance: income - expenses,
    };
  }, [transactions]);

  const resetTransactionForm = () => {
    setAmount('');
    setDescription('');
    setCategoryId('');
    setTransactionDate('');
    setType('EXPENSE');
  };

  const resetCategoryForm = () => {
    setCategoryName('');
  };

  const handleTransactionSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Enter a valid amount greater than 0.');
      return;
    }

    if (!categoryId) {
      setError('Please select a category before saving the transaction.');
      return;
    }

    setIsSavingTransaction(true);
    setError('');

    try {
      await createTransaction({
        amount: parsedAmount,
        description: description.trim() || undefined,
        categoryId,
        type,
        transactionDate: transactionDate || undefined,
      });

      resetTransactionForm();
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setIsSavingTransaction(false);
    }
  };

  const handleCategorySubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const trimmedName = categoryName.trim();

    if (!trimmedName) {
      setError('Category name cannot be empty.');
      return;
    }

    setIsSavingCategory(true);
    setError('');

    try {
      await createCategory(trimmedName);
      resetCategoryForm();
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    const shouldDelete = window.confirm(
      'Delete this transaction? This cannot be undone.',
    );

    if (!shouldDelete) {
      return;
    }

    setDeletingTransactionId(id);
    setError('');

    try {
      await deleteTransaction(id);
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setDeletingTransactionId(null);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const shouldDelete = window.confirm(
      'Delete this category? Existing transactions will be removed too.',
    );

    if (!shouldDelete) {
      return;
    }

    setDeletingCategoryId(id);
    setError('');

    try {
      await deleteCategory(id);
      if (categoryId === id) {
        setCategoryId('');
      }
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setDeletingCategoryId(null);
    }
  };

  const hasCategories = categories.length > 0;

  return (
    <div className="space-y-6 pb-8">
      <section
        id="overview"
        className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl"
      >
        <div className="grid gap-6 px-6 py-8 md:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)] md:px-8">
          <div className="space-y-4">
            <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-slate-200">
              Finance workspace
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Your money, categories, and transactions in one place.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                Review the big picture, add new activity, and manage categories
                without jumping between screens.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-slate-200">
              <span className="rounded-full bg-white/10 px-3 py-1">
                {transactions.length} transactions
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1">
                {categories.length} categories
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1">
                {formatCurrency(totals.balance)} balance
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-300">Income</p>
              <p className="mt-1 text-2xl font-semibold">
                {formatCurrency(summary?.income ?? totals.income)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-300">Expenses</p>
              <p className="mt-1 text-2xl font-semibold">
                {formatCurrency(summary?.expenses ?? totals.expenses)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-300">Balance</p>
              <p
                className={`mt-1 text-2xl font-semibold ${
                  (summary?.balance ?? totals.balance) >= 0
                    ? 'text-emerald-300'
                    : 'text-rose-300'
                }`}
              >
                {formatCurrency(summary?.balance ?? totals.balance)}
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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
          <p className="text-sm font-medium text-slate-500">Income</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatCurrency(summary?.income ?? totals.income)}
          </p>
          <p className="mt-1 text-sm text-slate-500">Money coming in</p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
          <p className="text-sm font-medium text-slate-500">Expenses</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatCurrency(summary?.expenses ?? totals.expenses)}
          </p>
          <p className="mt-1 text-sm text-slate-500">Money going out</p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
          <p className="text-sm font-medium text-slate-500">Balance</p>
          <p
            className={`mt-2 text-2xl font-semibold ${
              (summary?.balance ?? totals.balance) >= 0
                ? 'text-emerald-600'
                : 'text-rose-600'
            }`}
          >
            {formatCurrency(summary?.balance ?? totals.balance)}
          </p>
          <p className="mt-1 text-sm text-slate-500">Income minus expenses</p>
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
          <p className="text-sm font-medium text-slate-500">Categories</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {categories.length}
          </p>
          <p className="mt-1 text-sm text-slate-500">Used to organize spending</p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Spending overview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                A quick look at category breakdown and monthly spending.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Category breakdown
              </h3>
              {isLoading ? (
                <div className="flex h-64 items-center justify-center text-sm text-slate-500">
                  Loading chart...
                </div>
              ) : categoryBreakdown.length === 0 ? (
                <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
                  Add some expenses to see the breakdown.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      dataKey="total"
                      nameKey="categoryName"
                      outerRadius={92}
                      innerRadius={56}
                      paddingAngle={2}
                    >
                      {categoryBreakdown.map((_, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Monthly spending
              </h3>
              {isLoading ? (
                <div className="flex h-64 items-center justify-center text-sm text-slate-500">
                  Loading chart...
                </div>
              ) : monthlySpending.length === 0 ? (
                <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
                  Monthly activity will appear here once you add expenses.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
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
            </div>
          </div>
        </article>

        <aside className="space-y-6">
          <article
            id="transactions"
            className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80"
          >
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Add transaction
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Add income or expenses quickly, without leaving the page.
              </p>
            </div>

            <form onSubmit={handleTransactionSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 shadow-sm outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Date
                  </label>
                  <input
                    type="date"
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 shadow-sm outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    disabled={!hasCategories}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 shadow-sm outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    <option value="">
                      {hasCategories ? 'Select category' : 'No categories yet'}
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) =>
                      setType(e.target.value as 'INCOME' | 'EXPENSE')
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 shadow-sm outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-200"
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Description
                </label>
                <input
                  placeholder="Optional note"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 shadow-sm outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingTransaction || !hasCategories}
                className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isSavingTransaction ? 'Saving...' : 'Add transaction'}
              </button>
            </form>
          </article>

          <article
            id="categories"
            className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80"
          >
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Categories
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Keep categories simple so tracking stays fast.
              </p>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-3">
              <input
                value={categoryName}
                placeholder="New category name"
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 shadow-sm outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-200"
              />
              <button
                type="submit"
                disabled={isSavingCategory}
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingCategory ? 'Creating...' : 'Add category'}
              </button>
            </form>

            <div className="mt-6 space-y-3">
              {isLoading ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  Loading categories...
                </div>
              ) : categories.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No categories yet. Create one to start tagging transactions.
                </div>
              ) : (
                categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {category.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        Used in your transaction list
                      </p>
                    </div>
                    <button
                      onClick={() => void handleDeleteCategory(category.id)}
                      disabled={deletingCategoryId === category.id}
                      className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingCategoryId === category.id
                        ? 'Deleting...'
                        : 'Delete'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </article>
        </aside>
      </section>

      <section
        id="activity"
        className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Recent transactions
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              A quick view of what has happened most recently.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadData()}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
            Loading transactions...
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <h3 className="text-base font-semibold text-slate-900">
              No transactions yet
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Start by adding a transaction above. The recent activity feed will
              fill in here.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 md:block">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr className="text-left text-sm text-slate-500">
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="align-top">
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {formatDate(transaction.transactionDate)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            transaction.type === 'INCOME'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {transaction.type === 'INCOME' ? 'Income' : 'Expense'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {transaction.category.name}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                        {formatCurrency(Number(transaction.amount))}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {transaction.description?.trim() || 'No description'}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => void handleDeleteTransaction(transaction.id)}
                          disabled={deletingTransactionId === transaction.id}
                          className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingTransactionId === transaction.id
                            ? 'Deleting...'
                            : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {recentTransactions.map((transaction) => (
                <article
                  key={transaction.id}
                  className="rounded-2xl border border-slate-200 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {transaction.category.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatDate(transaction.transactionDate)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        transaction.type === 'INCOME'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {transaction.type === 'INCOME' ? 'Income' : 'Expense'}
                    </span>
                  </div>
                  <p className="mt-3 text-xl font-semibold text-slate-900">
                    {formatCurrency(Number(transaction.amount))}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {transaction.description?.trim() || 'No description'}
                  </p>
                  <button
                    onClick={() => void handleDeleteTransaction(transaction.id)}
                    disabled={deletingTransactionId === transaction.id}
                    className="mt-4 w-full rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingTransactionId === transaction.id
                      ? 'Deleting...'
                      : 'Delete transaction'}
                  </button>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default DashboardPage;

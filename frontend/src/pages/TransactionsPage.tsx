import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import {
  getTransactions,
  createTransaction,
  deleteTransaction,
} from '../api/transactions';
import { getCategories } from '../api/categories';

import { getApiError } from '../components/ApiError';
import type { Category } from '../types/category';
import type { Transaction } from '../types/transaction';

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

function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [transactionDate, setTransactionDate] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError('');

    try {
      const [transactionData, categoryData] = await Promise.all([
        getTransactions(),
        getCategories(),
      ]);

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
      count: transactions.length,
    };
  }, [transactions]);

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setCategoryName('');
    setTransactionDate('');
    setType('EXPENSE');
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Enter a valid amount greater than 0.');
      return;
    }

    const trimmedCategoryName = categoryName.trim();

    if (!trimmedCategoryName) {
      setError('Please enter a category before saving.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await createTransaction({
        amount: parsedAmount,
        description: description.trim() || undefined,
        categoryName: trimmedCategoryName,
        type,
        transactionDate: transactionDate || undefined,
      });

      resetForm();
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const shouldDelete = window.confirm(
      'Delete this transaction? This cannot be undone.',
    );

    if (!shouldDelete) {
      return;
    }

    setDeletingId(id);
    setError('');

    try {
      await deleteTransaction(id);
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl">
        <div className="grid gap-6 px-6 py-8 md:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)] md:px-8">
          <div className="space-y-4">
            <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-slate-200">
              Transactions
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Track money without losing the thread.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                Add income and expenses, scan totals at a glance, and keep every
                transaction tied to the right category.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-200">
              <span className="rounded-full bg-white/10 px-3 py-1">
                {totals.count} transactions
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
                {formatCurrency(totals.income)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-300">Expenses</p>
              <p className="mt-1 text-2xl font-semibold">
                {formatCurrency(totals.expenses)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-300">Balance</p>
              <p
                className={`mt-1 text-2xl font-semibold ${
                  totals.balance >= 0 ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {formatCurrency(totals.balance)}
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Add transaction
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Keep it fast. Amount, category, and type are the only required
              fields.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
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
                <input
                  list="transaction-categories"
                  placeholder="Groceries, Rent, Salary..."
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 shadow-sm outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-200"
                />
                <datalist id="transaction-categories">
                  {categories.map((category) => (
                    <option key={category.id} value={category.name} />
                  ))}
                </datalist>
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

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Tips: use categories to make the dashboard breakdown more
                useful.
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isSubmitting ? 'Saving...' : 'Add Transaction'}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Recent activity
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Tap a transaction to remove it if it was added by mistake.
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
          ) : transactions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <h3 className="text-base font-semibold text-slate-900">
                No transactions yet
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Add your first income or expense to start seeing totals and
                spending trends.
              </p>
              <div className="mt-4">
                <Link
                  to="/categories"
                  className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Manage categories
                </Link>
              </div>
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
                    {transactions.map((transaction) => (
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
                            {transaction.type === 'INCOME'
                              ? 'Income'
                              : 'Expense'}
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
                            onClick={() => void handleDelete(transaction.id)}
                            disabled={deletingId === transaction.id}
                            className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingId === transaction.id
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
                {transactions.map((transaction) => (
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
                      onClick={() => void handleDelete(transaction.id)}
                      disabled={deletingId === transaction.id}
                      className="mt-4 w-full rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === transaction.id
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
    </div>
  );
}

export default TransactionsPage;

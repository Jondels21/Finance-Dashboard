import { useEffect, useState } from 'react';

import {
  getTransactions,
  createTransaction,
  deleteTransaction,
} from '../api/transactions';

import { getCategories } from '../api/categories';

import type { Transaction } from '../types/transaction';
import type { Category } from '../types/category';

function TransactionsPage() {
  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [amount, setAmount] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [categoryId, setCategoryId] =
    useState('');

  const [type, setType] =
    useState<'INCOME' | 'EXPENSE'>(
      'EXPENSE',
    );

  const [transactionDate, setTransactionDate] =
  useState('');

  const loadData = async () => {
    const [
      transactionData,
      categoryData,
    ] = await Promise.all([
      getTransactions(),
      getCategories(),
    ]);

    setTransactions(transactionData);
    setCategories(categoryData);
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleSubmit = async (
    e: React.SubmitEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    await createTransaction({
      amount: Number(amount),
      description,
      categoryId,
      type,
      transactionDate,
    });

    setAmount('');
    setDescription('');
    setCategoryId('');
    setTransactionDate('');
    setType('EXPENSE');

    await loadData();
  };

  const handleDelete = async (
    id: string,
  ) => {
    await deleteTransaction(id);

    await loadData();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Transactions
        </h1>

        <p className="text-slate-500">
          Manage your income and expenses
        </p>
    </div>
      <div className="mb-8 rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">
          Add Transaction
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 md:grid-cols-2"
        >
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
            className="rounded-lg border border-slate-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            placeholder="Description"
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value,
              )
            }
            className="rounded-lg border border-slate-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="date"
            value={transactionDate}
            onChange={(e) =>
              setTransactionDate(
                e.target.value,
              )
            }
            className="rounded-lg border border-slate-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={categoryId}
            onChange={(e) =>
              setCategoryId(
                e.target.value,
              )
            }
            className="rounded-lg border border-slate-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              Select category
            </option>

            {categories.map(
              (category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ),
            )}
          </select>

          <select
            value={type}
            onChange={(e) =>
              setType(
                e.target
                  .value as
                  | 'INCOME'
                  | 'EXPENSE',
              )
            }
            className="rounded-lg border border-slate-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="EXPENSE">
              Expense
            </option>

            <option value="INCOME">
              Income
            </option>
          </select>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
            >
              Add Transaction
            </button>
          </div>
        </form>
      </div>
      <div className="mt-6">
      {transactions.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center shadow">
              No transactions yet.
            </div>
          ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-3 text-left">
                Date
              </th>

              <th className="px-4 py-3 text-left">
                Type
              </th>

              <th className="px-4 py-3 text-left">
                Category
              </th>

              <th className="px-4 py-3 text-left">
                Amount
              </th>

              <th className="px-4 py-3 text-left">
                Description
              </th>

              <th className="px-4 py-3 text-left">
                Actions
              </th>
            </tr>
          </thead>
           <tbody>
            {transactions.map(
              (transaction) => (
                <tr
                  key={transaction.id}
                  className="border-t hover:bg-slate-50"
                >
                  <td className="px-4 py-3">
                    {new Date(
                      transaction.transactionDate,
                    ).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={
                        transaction.type ===
                        'INCOME'
                          ? 'rounded-full bg-green-100 px-2 py-1 text-sm font-medium text-green-700'
                          : 'rounded-full bg-red-100 px-2 py-1 text-sm font-medium text-red-700'
                      }
                    >
                      {transaction.type}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {
                      transaction.category
                        .name
                    }
                  </td>

                  <td className="px-4 py-3 font-medium">
                    €
                    {Number(
                      transaction.amount,
                    ).toFixed(2)}
                  </td>

                  <td className="px-4 py-3">
                    {transaction.description ||
                      '-'}
                  </td>

                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        handleDelete(
                          transaction.id,
                        )
                      }
                      className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ),
            )}
          </tbody>
          
        </table>
        
      </div>
          )}
    </div>
    </div>
    
  );
}

export default TransactionsPage;
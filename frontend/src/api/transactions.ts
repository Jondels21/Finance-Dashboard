import { api } from './axios';

export async function getTransactions(month?: string) {
  const response = await api.get('/transactions', {
    params: month ? { month } : undefined,
  });
  return response.data;
}

export async function createTransaction(data: {
  amount: number;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  type: 'INCOME' | 'EXPENSE';
  transactionDate?: string;
}) {
  const response = await api.post(
    '/transactions',
    data,
  );

  return response.data;
}

export async function deleteTransaction(
  id: string,
) {
  await api.delete(`/transactions/${id}`);
}

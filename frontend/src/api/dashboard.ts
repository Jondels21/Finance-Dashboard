import { api } from './axios';

export async function getSummary() {
  const response = await api.get('/dashboard/summary');
  return response.data;
}

export async function getCategoryBreakdown() {
  const response = await api.get(
    '/dashboard/category-breakdown',
  );

  return response.data;
}

export async function getMonthlySpending() {
  const response = await api.get(
    '/dashboard/monthly-spending',
  );

  return response.data;
}
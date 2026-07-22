import { api } from './axios';

export async function getSummary(month?: string) {
  const response = await api.get('/dashboard/summary', {
    params: month ? { month } : undefined,
  });
  return response.data;
}

export async function getCategoryBreakdown(month?: string) {
  const response = await api.get('/dashboard/category-breakdown', {
    params: month ? { month } : undefined,
  });

  return response.data;
}

export async function getMonthlySpending(month?: string) {
  const response = await api.get('/dashboard/monthly-spending', {
    params: month ? { month } : undefined,
  });

  return response.data;
}

export async function getMonthlyIncome(month?: string) {
  const response = await api.get('/dashboard/monthly-income', {
    params: month ? { month } : undefined,
  });

  return response.data;
}
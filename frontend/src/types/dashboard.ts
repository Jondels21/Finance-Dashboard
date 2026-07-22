export interface Summary {
  income: number;
  expenses: number;
  balance: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  total: number;
}

export interface MonthlySpending {
  month: string;
  expenses: number;
}

export interface MonthlyIncome {
  month: string;
  income: number;
}
export interface Transaction {
  id: string;
  amount: number;
  description?: string;
  transactionDate: string;
  type: 'INCOME' | 'EXPENSE';

  category: {
    id: string;
    name: string;
  };
}
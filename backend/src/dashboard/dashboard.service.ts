import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionTypeEnum as TransactionType } from '../transactions/enums/transaction-type.enum';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId: string) {
    const income = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type: TransactionType.INCOME,
      },
      _sum: {
        amount: true,
      },
    });

    const expenses = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type: TransactionType.EXPENSE,
      },
      _sum: {
        amount: true,
      },
    });

    const totalIncome = Number(income._sum.amount ?? 0);

    const totalExpenses = Number(expenses._sum.amount ?? 0);

    return {
      income: totalIncome,
      expenses: totalExpenses,
      balance: totalIncome - totalExpenses,
    };
  }

  async getCategoryBreakdown(userId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        type: TransactionType.EXPENSE,
      },
      include: {
        category: true,
      },
    });

    const totals = new Map<
      string,
      {
        categoryId: string;
        categoryName: string;
        total: number;
      }
    >();

    for (const transaction of transactions) {
      const key = transaction.categoryId;

      const current = totals.get(key);

      const amount = Number(transaction.amount);

      if (current) {
        current.total += amount;
      } else {
        totals.set(key, {
          categoryId: transaction.categoryId,
          categoryName: transaction.category.name,
          total: amount,
        });
      }
    }

    return [...totals.values()].sort((a, b) => b.total - a.total);
  }

  async getMonthlySpending(userId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        type: TransactionType.EXPENSE,
      },
      orderBy: {
        transactionDate: 'asc',
      },
    });

    const monthlyTotals = new Map<string, number>();

    for (const transaction of transactions) {
      const date = transaction.transactionDate;
      const month = date.toISOString().slice(0, 7); // Get YYYY-MM format

      const current = monthlyTotals.get(month) ?? 0;

      monthlyTotals.set(month, current + Number(transaction.amount));
    }
    return [...monthlyTotals.entries()].map(([month, expenses]) => ({
      month,
      expenses,
    }));
  }
}

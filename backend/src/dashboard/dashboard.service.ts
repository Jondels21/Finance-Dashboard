import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionTypeEnum as TransactionType } from '../transactions/enums/transaction-type.enum';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private parseMonth(month?: string): { gte: Date; lt: Date } | undefined {
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return undefined;
    }

    const [year, monthNum] = month.split('-').map(Number);

    const start = new Date(year, monthNum - 1, 1);
    const end = new Date(year, monthNum, 1);

    return { gte: start, lt: end };
  }

  async getSummary(userId: string, month?: string) {
    const dateFilter = this.parseMonth(month);

    const income = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type: TransactionType.INCOME,
        ...(dateFilter ? { transactionDate: dateFilter } : {}),
      },
      _sum: {
        amount: true,
      },
    });

    const expenses = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type: TransactionType.EXPENSE,
        ...(dateFilter ? { transactionDate: dateFilter } : {}),
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

  async getCategoryBreakdown(userId: string, month?: string) {
    const dateFilter = this.parseMonth(month);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        type: TransactionType.EXPENSE,
        ...(dateFilter ? { transactionDate: dateFilter } : {}),
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

  async getMonthlySpending(userId: string, month?: string) {
    const dateFilter = this.parseMonth(month);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        type: TransactionType.EXPENSE,
        ...(dateFilter ? { transactionDate: dateFilter } : {}),
      },
      orderBy: {
        transactionDate: 'asc',
      },
    });

    const monthlyTotals = new Map<string, number>();

    for (const transaction of transactions) {
      const date = transaction.transactionDate;
      const monthKey = date.toISOString().slice(0, 7);

      const current = monthlyTotals.get(monthKey) ?? 0;

      monthlyTotals.set(monthKey, current + Number(transaction.amount));
    }
    return [...monthlyTotals.entries()].map(([monthKey, expenses]) => ({
      month: monthKey,
      expenses,
    }));
  }

  async getMonthlyIncome(userId: string, month?: string) {
    const dateFilter = this.parseMonth(month);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        type: TransactionType.INCOME,
        ...(dateFilter ? { transactionDate: dateFilter } : {}),
      },
      orderBy: {
        transactionDate: 'asc',
      },
    });

    const monthlyTotals = new Map<string, number>();

    for (const transaction of transactions) {
      const date = transaction.transactionDate;
      const monthKey = date.toISOString().slice(0, 7);

      const current = monthlyTotals.get(monthKey) ?? 0;

      monthlyTotals.set(monthKey, current + Number(transaction.amount));
    }
    return [...monthlyTotals.entries()].map(([monthKey, income]) => ({
      month: monthKey,
      income,
    }));
  }
}

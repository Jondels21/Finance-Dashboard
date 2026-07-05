import { useEffect, useState } from 'react';

import {
  getSummary,
  getCategoryBreakdown,
  getMonthlySpending,
} from '../api/dashboard';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import type { CategoryBreakdown, MonthlySpending, Summary } from '../types/dashboard';

function DashboardPage() {
  const [summary, setSummary] = useState<Summary>();

  const [categories, setCategories] =
    useState<CategoryBreakdown[]>([]);

  const [monthlyData, setMonthlyData] =
    useState<MonthlySpending[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [
        summaryData,
        categoryData,
        monthlySpendingData,
      ] = await Promise.all([
        getSummary(),
        getCategoryBreakdown(),
        getMonthlySpending(),
      ]);

      setSummary(summaryData);
      setCategories(categoryData);
      setMonthlyData(monthlySpendingData);
    };

    void loadData();
  }, []);

  if (!summary) {
    return <div>Loading...</div>;
  }

  const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#AA66CC',
  ];

  return (
    <div>
      <h1>Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500">
            Income
          </h3>

          <p className="text-2xl font-bold">
            €{summary.income}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500">
            Expenses
          </h3>

          <p className="text-2xl font-bold">
            €{summary.expenses}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500">
            Balance
          </h3>

          <p className="text-2xl font-bold">
            €{summary.balance}
          </p>
        </div>
      </div>

      <h2>Category Breakdown</h2>

      <ResponsiveContainer
        width="100%"
        height={300}
      >
        <PieChart>
          <Pie
            data={categories}
            dataKey="total"
            nameKey="categoryName"
            outerRadius={100}
            label
          >
            {categories.map(
              (_, index) => (
                <Cell
                  key={index}
                  fill={
                    COLORS[
                      index %
                        COLORS.length
                    ]
                  }
                />
              ),
            )}
          </Pie>

          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      <h2>Monthly Spending</h2>

      <ResponsiveContainer
        width="100%"
        height={300}
      >
        <LineChart
          data={monthlyData}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="expenses"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DashboardPage;
'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface BudgetChartProps {
  budgets: any[];
  budgetHistory: any[];
}

export default function BudgetCharts({ budgets, budgetHistory }: BudgetChartProps) {
  // Prepare data for category comparison chart
  const categoryData = {
    labels: budgets.map(b => b.category),
    datasets: [
      {
        label: 'Budget',
        data: budgets.map(b => b.amount),
        backgroundColor: 'rgba(59, 130, 246, 0.5)', // blue
      },
      {
        label: 'Spent',
        data: budgets.map(b => b.spent),
        backgroundColor: 'rgba(239, 68, 68, 0.5)', // red
      },
    ],
  };

  // Prepare data for spending trends
  const months = ['January', 'February', 'March', 'April'];
  const trendData = {
    labels: months,
    datasets: budgets.map(budget => {
      const history = budgetHistory.find(h => h.category === budget.category)?.history || [];
      return {
        label: budget.category,
        data: history.map(h => h.spent),
        borderColor: getRandomColor(),
        tension: 0.4,
      };
    }),
  };

  // Prepare data for budget utilization donut
  const utilizationData = {
    labels: budgets.map(b => b.category),
    datasets: [{
      data: budgets.map(b => (b.spent / b.amount) * 100),
      backgroundColor: [
        'rgba(59, 130, 246, 0.5)',  // blue
        'rgba(34, 197, 94, 0.5)',   // green
        'rgba(239, 68, 68, 0.5)',   // red
        'rgba(234, 179, 8, 0.5)',   // yellow
        'rgba(168, 85, 247, 0.5)',  // purple
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(34, 197, 94, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(234, 179, 8, 1)',
        'rgba(168, 85, 247, 1)',
      ],
      borderWidth: 1,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const barOptions = {
    ...options,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Category Comparison */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Budget vs. Spending by Category</h3>
        <div className="h-[300px]">
          <Bar data={categoryData} options={barOptions} />
        </div>
      </div>

      {/* Spending Trends */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Monthly Spending Trends</h3>
        <div className="h-[300px]">
          <Line data={trendData} options={options} />
        </div>
      </div>

      {/* Budget Utilization */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Budget Utilization (%)</h3>
        <div className="h-[300px]">
          <Doughnut data={utilizationData} options={options} />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Budget Insights</h3>
        <div className="space-y-4">
          {budgets.map(budget => {
            const percentage = (budget.spent / budget.amount) * 100;
            const status = percentage >= 100 ? 'red' : percentage >= 80 ? 'yellow' : 'green';
            const history = budgetHistory.find(h => h.category === budget.category)?.history || [];
            const trend = history.length > 1 
              ? history[history.length - 1].spent - history[history.length - 2].spent
              : 0;

            return (
              <div key={budget.id} className="border-b pb-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{budget.category}</span>
                  <span className={`${
                    status === 'red' ? 'text-red-500' :
                    status === 'yellow' ? 'text-yellow-500' :
                    'text-green-500'
                  }`}>
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="text-sm text-gray-500 flex justify-between">
                  <span>Trend: {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'}</span>
                  <span>${Math.abs(trend).toFixed(2)} {trend > 0 ? 'increase' : 'decrease'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getRandomColor() {
  const colors = [
    'rgb(59, 130, 246)',   // blue
    'rgb(34, 197, 94)',    // green
    'rgb(239, 68, 68)',    // red
    'rgb(234, 179, 8)',    // yellow
    'rgb(168, 85, 247)',   // purple
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

import { mockAccounts, mockMonthlyTotals } from '@/data/mockData';

export default function Overview() {
  const totalBalance = mockAccounts.reduce((sum, account) => sum + account.balance, 0);
  const monthlyIncome = mockMonthlyTotals[mockMonthlyTotals.length - 1].income;
  const monthlyExpenses = mockMonthlyTotals[mockMonthlyTotals.length - 1].expenses;

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Net Worth</h3>
          <p className="text-2xl font-bold text-gray-900">
            ${totalBalance.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Monthly Income</h3>
          <p className="text-2xl font-bold text-green-600">
            ${monthlyIncome.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Monthly Expenses</h3>
          <p className="text-2xl font-bold text-red-600">
            ${monthlyExpenses.toFixed(2)}
          </p>
        </div>
      </div>
    </section>
  );
}

import React, { useState, useEffect } from 'react';
import { AccountType } from '@/types/account';
import { AccountData } from '@/services/accountService';
import { formatCurrency } from '@/utils/formatters';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DebtAnalyticsProps {
  debt: AccountData;
}

interface PayoffScenario {
  monthlyPayment: number;
  totalMonths: number;
  totalInterestPaid: number;
  payoffDate: Date;
  schedule: {
    month: string;
    balance: number;
    interestPaid: number;
    principalPaid: number;
  }[];
}

const DebtAnalytics: React.FC<DebtAnalyticsProps> = ({ debt }) => {
  const [monthlyPayment, setMonthlyPayment] = useState<number>(calculateDefaultPayment());
  const [payoffScenario, setPayoffScenario] = useState<PayoffScenario | null>(null);
  const [chartData, setChartData] = useState<ChartData<'line'> | null>(null);

  // Calculate a default monthly payment based on debt type and balance
  function calculateDefaultPayment(): number {
    const balance = Math.abs(debt.balance);
    
    switch (debt.type) {
      case AccountType.CREDIT_CARD:
        // Minimum payment is typically 2-4% of the balance
        return Math.max(Math.round(balance * 0.03), 25);
      case AccountType.MORTGAGE:
        // Rough estimate for a 30-year mortgage
        return Math.round(balance / 180); // Very simplified
      case AccountType.LOAN:
        // Rough estimate for a 5-year loan
        return Math.round(balance / 50);
      default:
        return Math.round(balance / 60);
    }
  }

  // Calculate payoff scenario when debt or payment changes
  useEffect(() => {
    if (debt && monthlyPayment > 0) {
      const scenario = calculatePayoffScenario(debt, monthlyPayment);
      setPayoffScenario(scenario);
      
      // Generate chart data
      const labels = scenario.schedule.map(month => month.month);
      const balances = scenario.schedule.map(month => month.balance);
      
      setChartData({
        labels,
        datasets: [
          {
            label: 'Remaining Balance',
            data: balances,
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
            tension: 0.3,
          },
        ],
      });
    }
  }, [debt, monthlyPayment]);

  // Calculate detailed payoff scenario
  function calculatePayoffScenario(debt: AccountData, monthlyPayment: number): PayoffScenario {
    const balance = Math.abs(debt.balance);
    const interestRate = debt.interestRate || 5; // Default to 5% if not specified
    const monthlyRate = interestRate / 100 / 12;
    
    let remainingBalance = balance;
    let month = 0;
    let totalInterestPaid = 0;
    const schedule = [];
    const today = new Date();
    
    while (remainingBalance > 0 && month < 600) { // Cap at 50 years (600 months)
      month++;
      
      // Calculate interest for this month
      const interestThisMonth = remainingBalance * monthlyRate;
      
      // Calculate principal payment
      let principalPayment = monthlyPayment - interestThisMonth;
      
      // If principal payment is more than remaining balance, adjust
      if (principalPayment > remainingBalance) {
        principalPayment = remainingBalance;
      }
      
      // Update remaining balance
      remainingBalance -= principalPayment;
      
      // Update total interest paid
      totalInterestPaid += interestThisMonth;
      
      // Format month for display
      const monthDate = new Date(today);
      monthDate.setMonth(today.getMonth() + month);
      const monthString = monthDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      // Add to schedule
      schedule.push({
        month: monthString,
        balance: remainingBalance,
        interestPaid: interestThisMonth,
        principalPaid: principalPayment,
      });
      
      // Only keep 12 points for the chart (1 per year) after the first year
      if (month > 12 && month % 12 !== 0 && schedule.length > 24) {
        schedule.pop();
      }
    }
    
    // Calculate payoff date
    const payoffDate = new Date(today);
    payoffDate.setMonth(today.getMonth() + month);
    
    return {
      monthlyPayment,
      totalMonths: month,
      totalInterestPaid,
      payoffDate,
      schedule,
    };
  }

  // Calculate alternative payment scenarios
  const calculateAlternativeScenarios = () => {
    if (!payoffScenario) return null;
    
    const basePayment = payoffScenario.monthlyPayment;
    const scenarios = [
      { label: '25% Less', payment: Math.round(basePayment * 0.75) },
      { label: 'Current', payment: basePayment },
      { label: '25% More', payment: Math.round(basePayment * 1.25) },
      { label: '50% More', payment: Math.round(basePayment * 1.5) },
      { label: 'Double', payment: basePayment * 2 },
    ];
    
    return scenarios.map(scenario => {
      if (scenario.payment === basePayment) {
        return { ...scenario, months: payoffScenario.totalMonths };
      }
      
      const result = calculatePayoffScenario(debt, scenario.payment);
      return { ...scenario, months: result.totalMonths };
    });
  };
  
  const alternativeScenarios = calculateAlternativeScenarios();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Debt Payoff Calculator</h2>
        
        <div className="mb-6">
          <label htmlFor="monthlyPayment" className="block text-sm font-medium mb-1">
            Monthly Payment
          </label>
          <div className="flex items-center">
            <span className="mr-2">$</span>
            <input
              type="number"
              id="monthlyPayment"
              value={monthlyPayment}
              onChange={(e) => setMonthlyPayment(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>
        </div>
        
        {payoffScenario && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Payoff Time</p>
                <p className="text-xl font-bold">
                  {payoffScenario.totalMonths < 12 
                    ? `${payoffScenario.totalMonths} months` 
                    : `${Math.floor(payoffScenario.totalMonths / 12)} years ${payoffScenario.totalMonths % 12} months`}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Total Interest</p>
                <p className="text-xl font-bold text-red-500">
                  {formatCurrency(payoffScenario.totalInterestPaid)}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Payoff Date</p>
                <p className="text-xl font-bold">
                  {payoffScenario.payoffDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </p>
              </div>
            </div>
            
            {chartData && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Balance Over Time</h3>
                <div className="h-64">
                  <Line 
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: (value) => formatCurrency(Number(value)),
                          },
                        },
                      },
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: (context) => {
                              return `Balance: ${formatCurrency(context.parsed.y)}`;
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {alternativeScenarios && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Payment Scenarios</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scenario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Payment
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payoff Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difference
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {alternativeScenarios.map((scenario, index) => (
                  <tr 
                    key={index}
                    className={scenario.label === 'Current' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-medium">{scenario.label}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatCurrency(scenario.payment)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {scenario.months < 12 
                        ? `${scenario.months} months` 
                        : `${Math.floor(scenario.months / 12)} years ${scenario.months % 12} months`}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {scenario.label === 'Current' ? (
                        '—'
                      ) : (
                        <span className={scenario.months < payoffScenario!.totalMonths ? 'text-green-500' : 'text-red-500'}>
                          {scenario.months < payoffScenario!.totalMonths 
                            ? `${payoffScenario!.totalMonths - scenario.months} months faster` 
                            : `${scenario.months - payoffScenario!.totalMonths} months slower`}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtAnalytics;

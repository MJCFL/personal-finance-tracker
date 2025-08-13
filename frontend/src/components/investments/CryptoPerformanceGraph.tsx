'use client';

import React, { useMemo } from 'react';
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
  ChartOptions
} from 'chart.js';
import { ICrypto } from '@/types/investment';
import { formatCurrency } from '@/utils/formatters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CryptoPerformanceGraphProps {
  crypto: ICrypto;
}

export default function CryptoPerformanceGraph({ crypto }: CryptoPerformanceGraphProps) {
  // Sort lots by purchase date
  const sortedLots = useMemo(() => {
    return [...crypto.lots].sort((a, b) => 
      new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime()
    );
  }, [crypto.lots]);

  // Calculate performance data
  const performanceData = useMemo(() => {
    if (sortedLots.length === 0) return { labels: [], datasets: [] };

    const labels: string[] = [];
    const costBasisData: number[] = [];
    const currentValueData: number[] = [];
    const gainLossData: number[] = [];
    
    let cumulativeAmount = 0;
    let cumulativeCost = 0;

    // Add purchase data points
    for (const lot of sortedLots) {
      // Format date as MM/DD/YYYY
      const purchaseDate = new Date(lot.purchaseDate);
      const month = (purchaseDate.getMonth() + 1).toString().padStart(2, '0');
      const day = purchaseDate.getDate().toString().padStart(2, '0');
      const year = purchaseDate.getFullYear();
      const dateFormatted = `${month}/${day}/${year}`;
      
      labels.push(dateFormatted);
      
      cumulativeAmount += lot.amount;
      cumulativeCost += lot.amount * lot.purchasePrice;
      
      const currentValue = cumulativeAmount * crypto.currentPrice;
      const gainLoss = currentValue - cumulativeCost;
      
      costBasisData.push(cumulativeCost);
      currentValueData.push(currentValue);
      gainLossData.push(gainLoss);
    }
    
    // Add today's point if it's different from the last purchase date
    const today = new Date();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const year = today.getFullYear();
    const todayFormatted = `${month}/${day}/${year}`;
    
    // Only add today's point if it's different from the last point
    if (labels[labels.length - 1] !== todayFormatted) {
      labels.push(todayFormatted);
      costBasisData.push(cumulativeCost); // Cost basis stays the same
      const finalCurrentValue = cumulativeAmount * crypto.currentPrice;
      currentValueData.push(finalCurrentValue); // Current value with today's price
      gainLossData.push(finalCurrentValue - cumulativeCost); // Gain/loss at this point
    }
    
    // Determine if overall performance is positive or negative
    const totalGainLoss = cumulativeAmount * crypto.currentPrice - cumulativeCost;
    const isPositivePerformance = totalGainLoss >= 0;
    
    return {
      labels,
      datasets: [
        {
          label: 'Money Invested (Cost Basis)',
          data: costBasisData,
          borderColor: '#6b7280',      // Gray color
          backgroundColor: 'rgba(107, 114, 128, 0.15)',
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: '#6b7280',
          tension: 0.1,
          fill: true
        },
        {
          label: 'Current Market Value',
          data: currentValueData,
          borderColor: '#3b82f6',    // Blue color
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: '#3b82f6',
          tension: 0.1,
          fill: true
        },
        {
          label: 'Gain/Loss',
          data: gainLossData,
          borderColor: isPositivePerformance ? '#22c55e' : '#ef4444',     // Green if positive, red if negative
          backgroundColor: isPositivePerformance ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: isPositivePerformance ? '#22c55e' : '#ef4444',
          tension: 0.1,
          fill: false
        }
      ]
    };
  }, [sortedLots, crypto.currentPrice]);

  // Chart options
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return formatCurrency(value as number);
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 20,
          usePointStyle: true,
          boxWidth: 15,
          boxHeight: 15,
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: `${crypto.name} (${crypto.symbol}) - Performance Over Time`,
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 30
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        callbacks: {
          title: function(tooltipItems) {
            // Format the date more clearly
            const date = tooltipItems[0].label;
            return `Purchase Date: ${date}`;
          },
          label: function(context) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          }
        }
      }
    }
  };

  if (sortedLots.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No purchase history available</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <Line data={performanceData} options={options} />
    </div>
  );
}

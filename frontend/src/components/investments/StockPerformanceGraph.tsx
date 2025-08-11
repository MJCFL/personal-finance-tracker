'use client';

import React, { useMemo } from 'react';
import { IStockLot } from '@/models/InvestmentAccount';
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
  ChartOptions,
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

interface StockPerformanceGraphProps {
  ticker: string;
  companyName: string;
  lots: IStockLot[];
  currentPrice: number;
}

const StockPerformanceGraph: React.FC<StockPerformanceGraphProps> = ({
  ticker,
  companyName,
  lots,
  currentPrice,
}) => {
  // Sort lots by purchase date
  const sortedLots = useMemo(() => {
    return [...lots].sort((a, b) => {
      return new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime();
    });
  }, [lots]);

  // Calculate cumulative performance data
  const performanceData = useMemo(() => {
    if (sortedLots.length === 0) return { labels: [], datasets: [] };

    const labels: string[] = [];
    const costBasisData: number[] = [];
    const currentValueData: number[] = [];
    const gainLossData: number[] = [];
    
    let cumulativeShares = 0;
    let cumulativeCost = 0;

    for (const lot of sortedLots) {
      // Format date as MM/DD/YYYY
      const purchaseDate = new Date(lot.purchaseDate);
      const month = (purchaseDate.getMonth() + 1).toString().padStart(2, '0');
      const day = purchaseDate.getDate().toString().padStart(2, '0');
      const year = purchaseDate.getFullYear();
      const dateFormatted = `${month}/${day}/${year}`;
      
      labels.push(dateFormatted);
      
      cumulativeShares += lot.shares;
      cumulativeCost += lot.shares * lot.purchasePrice;
      
      const currentValue = cumulativeShares * currentPrice;
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
      const finalCurrentValue = cumulativeShares * currentPrice;
      currentValueData.push(finalCurrentValue); // Current value stays the same
      gainLossData.push(finalCurrentValue - cumulativeCost); // Gain/loss at this point
    }
    
    // Determine if overall performance is positive or negative
    const totalGainLoss = cumulativeShares * currentPrice - cumulativeCost;
    const isPositivePerformance = totalGainLoss >= 0;
    const performanceColor = isPositivePerformance ? '#22c55e' : '#ef4444'; // Green if positive, red if negative
    
    return {
      labels,
      datasets: [
        {
          label: 'Money Invested (Cost Basis)',
          data: costBasisData,
          borderColor: '#6b7280', // Gray color
          backgroundColor: 'rgba(107, 114, 128, 0.15)',
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: '#6b7280',
          tension: 0.1,
          fill: true,
        },
        {
          label: 'Current Market Value',
          data: currentValueData,
          borderColor: '#3b82f6', // Blue color
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: '#3b82f6',
          tension: 0.1,
          fill: true,
        },
        {
          label: 'Gain/Loss',
          data: gainLossData,
          borderColor: performanceColor,
          backgroundColor: `${performanceColor}20`, // Light version of the color
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: performanceColor,
          tension: 0.1,
          fill: false,
        },
      ],
    };
  }, [lots, currentPrice]);

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
    plugins: {
      legend: {
        position: 'top' as const,
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
        text: `${ticker} (${companyName}) - Performance Over Time`,
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
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(context.parsed.y);
            }
            return label;
          },
          afterLabel: function(context) {
            // Add additional context based on which line this is
            if (context.datasetIndex === 0) { // Cost Basis
              return 'Amount you invested at this point';
            } else { // Current Value
              return 'Current worth of shares at this point';
            }
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false, // Allow the scale to adjust to data including negative values
        grid: {
          color: 'rgba(200, 200, 200, 0.4)',
          lineWidth: 1
        },
        border: {
          display: true,
          width: 1,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          padding: 10,
          font: {
            size: 12,
            weight: 'bold'
          },
          color: '#333',
          callback: function(value) {
            // Format with proper negative sign if needed
            const numValue = Number(value);
            return (numValue < 0 ? '-$' : '$') + Math.abs(numValue).toLocaleString();
          }
        },
        title: {
          display: true,
          text: 'Value ($)',
          font: {
            size: 14,
            weight: 'bold'
          },
          color: '#333',
          padding: {
            bottom: 10
          }
        }
      },
      x: {
        grid: {
          display: true,
          color: 'rgba(200, 200, 200, 0.2)',
          lineWidth: 1
        },
        border: {
          display: true,
          width: 1,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 12,
            weight: 'bold'
          },
          color: '#333',
          callback: function(value, index, values) {
            // Ensure dates are displayed as MM/DD/YYYY
            const label = this.getLabelForValue(index);
            if (!label) return '';
            
            // If the label is already in MM/DD/YYYY format, return it as is
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(label)) {
              return label;
            }
            
            // Otherwise, try to parse and reformat the date
            try {
              const parts = label.split('/');
              if (parts.length === 3) {
                // If it's in DD/MM/YYYY format, convert to MM/DD/YYYY
                return `${parts[1]}/${parts[0]}/${parts[2]}`;
              }
              return label;
            } catch (e) {
              return label;
            }
          }
        },
        title: {
          display: true,
          text: 'Purchase Dates',
          font: {
            size: 14,
            weight: 'bold'
          },
          color: '#333',
          padding: {
            top: 10
          }
        }
      }
    }
  };

  // Calculate overall performance metrics
  const totalShares = useMemo(() => {
    return lots.reduce((sum, lot) => sum + lot.shares, 0);
  }, [lots]);

  const totalCostBasis = useMemo(() => {
    return lots.reduce((sum, lot) => sum + (lot.shares * lot.purchasePrice), 0);
  }, [lots]);

  const totalCurrentValue = useMemo(() => {
    return totalShares * currentPrice;
  }, [totalShares, currentPrice]);

  const totalGainLoss = useMemo(() => {
    return totalCurrentValue - totalCostBasis;
  }, [totalCurrentValue, totalCostBasis]);

  const totalGainLossPercentage = useMemo(() => {
    return totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;
  }, [totalGainLoss, totalCostBasis]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return value.toFixed(2) + '%';
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Performance Analysis</h3>
      
      {lots.length === 0 ? (
        <p className="text-gray-500">No performance data available. Add stock lots to see performance analysis.</p>
      ) : (
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div style={{ height: '400px' }}>
            <Line data={performanceData} options={options} />
          </div>
        </div>
      )}
    </div>
  );
};

export default StockPerformanceGraph;

'use client';

import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { Asset } from '@/types/asset';
import { getAssets } from '@/services/assetService';

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

// Generate mock historical data for demonstration purposes
// In a real app, this would come from your backend API
const generateMockHistoricalData = (assets: Asset[]) => {
  const today = new Date();
  const dates = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(today.getMonth() - 5 + i);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  });

  // Calculate total value for each month with some random fluctuation
  const totalValues = dates.map((_, index) => {
    let baseValue = assets.reduce((sum, asset) => {
      return sum + (asset.currentValue || asset.value || 0);
    }, 0);

    // Add historical "growth" - earlier months have lower values
    // This is just for demo purposes
    const growthFactor = 0.85 + (index * 0.03);
    
    // Add some randomness
    const randomFactor = 0.95 + Math.random() * 0.1;
    
    return baseValue * growthFactor * randomFactor;
  });

  return {
    dates,
    totalValues,
  };
};

export default function PerformanceChart() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [historicalData, setHistoricalData] = useState<{ dates: string[], totalValues: number[] }>({ dates: [], totalValues: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        const fetchedAssets = await getAssets();
        setAssets(fetchedAssets);
        
        // Generate mock historical data based on current assets
        // In a real app, you would fetch this from your API
        setHistoricalData(generateMockHistoricalData(fetchedAssets));
      } catch (err) {
        console.error('Failed to fetch assets for performance chart:', err);
        setError('Failed to load performance data');
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  const chartData = {
    labels: historicalData.dates,
    datasets: [
      {
        label: 'Portfolio Value',
        data: historicalData.totalValues,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'white',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg shadow-lg p-6 h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 rounded-lg shadow-lg p-6 h-80 flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg shadow-lg p-6 h-80 flex items-center justify-center">
        <p className="text-gray-400">No assets found. Add some assets to see performance over time.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-100">Portfolio Performance</h2>
      <div className="h-64">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

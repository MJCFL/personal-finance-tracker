'use client';

import React, { useEffect, useState } from 'react';
import { Asset, AssetType, AssetCategory } from '@/types/asset';
import { getAssets } from '@/services/assetService';

interface Insight {
  title: string;
  description: string;
  type: 'info' | 'warning' | 'success';
  icon: string;
}

export default function FinancialInsights() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        const fetchedAssets = await getAssets();
        setAssets(fetchedAssets);
        
        // Generate insights based on assets
        const generatedInsights = generateInsights(fetchedAssets);
        setInsights(generatedInsights);
      } catch (err) {
        console.error('Failed to fetch assets for insights:', err);
        setError('Failed to load financial insights');
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  const generateInsights = (assets: Asset[]): Insight[] => {
    const insights: Insight[] = [];
    
    // Calculate total portfolio value
    const totalValue = assets.reduce((sum, asset) => {
      return sum + (asset.currentValue || asset.value || 0);
    }, 0);
    
    // Calculate asset type allocation
    const typeAllocation: Record<AssetType, number> = {
      [AssetType.STOCK]: 0,
      [AssetType.REAL_ESTATE]: 0,
      [AssetType.CASH]: 0,
      [AssetType.CRYPTO]: 0,
      [AssetType.OTHER]: 0,
    };
    
    // Map asset category to AssetType
    const mapCategoryToType = (category: AssetCategory): AssetType => {
      if (category === 'stocks') return AssetType.STOCK;
      if (category === 'real_estate') return AssetType.REAL_ESTATE;
      if (category === 'watches' || category === 'art' || category === 'jewelry' || category === 'vehicles') return AssetType.OTHER;
      return AssetType.OTHER;
    };
    
    assets.forEach((asset) => {
      const assetType = asset.type || mapCategoryToType(asset.category);
      typeAllocation[assetType] += asset.currentValue || asset.value || 0;
    });
    
    // Calculate percentages
    const typePercentages: Record<AssetType, number> = {} as Record<AssetType, number>;
    Object.keys(typeAllocation).forEach((type) => {
      const assetType = type as AssetType;
      typePercentages[assetType] = totalValue > 0 
        ? (typeAllocation[assetType] / totalValue) * 100 
        : 0;
    });
    
    // Insight 1: Portfolio Diversification
    if (assets.length > 0) {
      const highestType = Object.keys(typePercentages).reduce((a, b) => 
        typePercentages[a as AssetType] > typePercentages[b as AssetType] ? a : b
      ) as AssetType;
      
      const highestPercentage = typePercentages[highestType];
      
      if (highestPercentage > 70) {
        insights.push({
          title: 'Low Diversification',
          description: `${highestPercentage.toFixed(1)}% of your portfolio is in ${highestType.toLowerCase().replace('_', ' ')}. Consider diversifying to reduce risk.`,
          type: 'warning',
          icon: '⚠️',
        });
      } else if (highestPercentage < 50 && assets.length >= 3) {
        insights.push({
          title: 'Well Diversified',
          description: 'Your portfolio is well diversified across different asset types, which may help reduce overall risk.',
          type: 'success',
          icon: '✅',
        });
      }
    }
    
    // Insight 2: Cash Reserve
    const cashPercentage = typePercentages[AssetType.CASH];
    if (cashPercentage < 10 && totalValue > 1000) {
      insights.push({
        title: 'Low Cash Reserve',
        description: `Only ${cashPercentage.toFixed(1)}% of your portfolio is in cash. Consider maintaining a larger emergency fund.`,
        type: 'warning',
        icon: '💰',
      });
    } else if (cashPercentage > 30 && totalValue > 1000) {
      insights.push({
        title: 'High Cash Reserve',
        description: `${cashPercentage.toFixed(1)}% of your portfolio is in cash. Consider investing some to potentially earn higher returns.`,
        type: 'info',
        icon: '💵',
      });
    }
    
    // Insight 3: Portfolio Growth
    const stockAssets = assets.filter(asset => {
      const assetType = asset.type || (asset.category === 'stocks' ? AssetType.STOCK : null);
      return assetType === AssetType.STOCK;
    });
    if (stockAssets.length > 0) {
      const growingStocks = stockAssets.filter(asset => {
        // For this example, we'll consider a stock as growing if its current value is higher than its purchase price
        // In a real app, you would have historical data to compare
        const currentVal = asset.currentValue || asset.value || 0;
        const purchaseVal = asset.purchasePrice || (asset.value * 0.9); // Assume purchase price was 90% of current if not available
        return currentVal > purchaseVal;
      });
      
      const growthPercentage = stockAssets.length > 0 
        ? (growingStocks.length / stockAssets.length) * 100 
        : 0;
      
      if (growthPercentage >= 60) {
        insights.push({
          title: 'Strong Stock Performance',
          description: `${growthPercentage.toFixed(0)}% of your stocks are growing in value. Your stock picks are performing well.`,
          type: 'success',
          icon: '📈',
        });
      } else if (growthPercentage <= 40 && stockAssets.length >= 3) {
        insights.push({
          title: 'Underperforming Stocks',
          description: `Only ${growthPercentage.toFixed(0)}% of your stocks are growing in value. Consider reviewing your investment strategy.`,
          type: 'warning',
          icon: '📉',
        });
      }
    }
    
    // Add general insights if we don't have enough specific ones
    if (insights.length < 2) {
      if (assets.length === 0) {
        insights.push({
          title: 'Get Started',
          description: 'Add your first assets to receive personalized financial insights.',
          type: 'info',
          icon: '🚀',
        });
      } else {
        insights.push({
          title: 'Track Regularly',
          description: 'Update your asset values regularly to get more accurate insights and track your financial progress.',
          type: 'info',
          icon: '📊',
        });
      }
    }
    
    return insights;
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg shadow-lg p-6 h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 rounded-lg shadow-lg p-6 h-64 flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-100">Financial Insights</h2>
      
      {insights.length === 0 ? (
        <p className="text-gray-400">Add more assets to receive personalized financial insights.</p>
      ) : (
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg flex items-start gap-3 ${
                insight.type === 'warning' ? 'bg-amber-900/30 border border-amber-700/50' :
                insight.type === 'success' ? 'bg-green-900/30 border border-green-700/50' :
                'bg-blue-900/30 border border-blue-700/50'
              }`}
            >
              <div className="text-2xl">{insight.icon}</div>
              <div>
                <h3 className="font-medium text-white">{insight.title}</h3>
                <p className="text-sm text-gray-300">{insight.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

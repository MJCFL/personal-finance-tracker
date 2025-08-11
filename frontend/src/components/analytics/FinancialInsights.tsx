'use client';

import React, { useEffect, useState } from 'react';
import { Asset, AssetType, AssetCategory, ASSET_CATEGORIES } from '@/types/asset';
import { getAssets } from '@/services/assetService';
import { getRecommendations } from '@/services/insightsService';
import { getAccounts } from '@/services/accountService';

interface Insight {
  title: string;
  description: string;
  type: 'info' | 'warning' | 'success';
  icon: string;
  category?: string;
}

interface Recommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  potentialSavings: number;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

export default function FinancialInsights() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch assets and accounts in parallel
        const [fetchedAssets, fetchedAccounts] = await Promise.all([
          getAssets(),
          getAccounts()
        ]);
        
        setAssets(fetchedAssets);
        setAccounts(fetchedAccounts);
        
        // Generate insights based on assets
        const generatedInsights = generateInsights(fetchedAssets);
        
        // Get recommendations from the insights service
        const fetchedRecommendations = await getRecommendations();
        
        // Convert recommendations to insights format for savings goals
        const savingsInsights = fetchedRecommendations
          .filter(rec => rec.category.toLowerCase() === 'savings')
          .map(rec => ({
            title: rec.title,
            description: rec.description,
            type: rec.priority === 'high' ? 'warning' as const : 
                  rec.priority === 'medium' ? 'info' as const : 'success' as const,
            icon: rec.type === 'achievement' ? '🏆' : 
                 rec.type === 'goal' ? '🎯' : 
                 rec.type === 'warning' ? '⚠️' : '💡',
            category: 'savings'
          }));
        
        // Combine asset insights with savings insights
        setInsights([...generatedInsights, ...savingsInsights]);
        setRecommendations(fetchedRecommendations);
      } catch (err) {
        console.error('Failed to fetch data for insights:', err);
        setError('Failed to load financial insights');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const generateInsights = (assets: Asset[]): Insight[] => {
    const insights: Insight[] = [];
    
    // Calculate total portfolio value
    const totalValue = assets.reduce((sum, asset) => {
      return sum + (asset.currentValue || asset.value || 0);
    }, 0);
    
    // Calculate asset category allocation
    const categoryAllocation: Record<string, number> = {};
    
    // Initialize all categories with zero
    ASSET_CATEGORIES.forEach((cat) => {
      categoryAllocation[cat.value] = 0;
    });
    
    // Sum up values by category
    assets.forEach((asset) => {
      const category = asset.category;
      categoryAllocation[category] = (categoryAllocation[category] || 0) + 
        (asset.currentValue || asset.value || 0);
    });
    
    // Calculate percentages
    const categoryPercentages: Record<string, number> = {};
    Object.keys(categoryAllocation).forEach((category) => {
      categoryPercentages[category] = totalValue > 0 
        ? (categoryAllocation[category] / totalValue) * 100 
        : 0;
    });
    
    // Insight 1: Portfolio Diversification
    if (assets.length > 0) {
      const highestCategory = Object.keys(categoryPercentages).reduce((a, b) => 
        categoryPercentages[a] > categoryPercentages[b] ? a : b
      );
      
      const highestPercentage = categoryPercentages[highestCategory];
      
      // Get the display name for the category
      const categoryInfo = ASSET_CATEGORIES.find(cat => cat.value === highestCategory);
      const categoryDisplayName = categoryInfo ? categoryInfo.label : highestCategory;
      
      if (highestPercentage > 70) {
        insights.push({
          title: 'Low Diversification',
          description: `${highestPercentage.toFixed(1)}% of your portfolio is in ${categoryDisplayName}. Consider diversifying to reduce risk.`,
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
    // Look for a 'cash' category, or default to 0 if not found
    const cashCategory = ASSET_CATEGORIES.find(cat => cat.value === 'cash' as AssetCategory);
    const cashPercentage = cashCategory ? (categoryPercentages[cashCategory.value] || 0) : 0;
    
    if (cashPercentage < 10 && totalValue > 1000) {
      insights.push({
        title: 'Low Cash Reserve',
        description: `Only ${cashPercentage.toFixed(1)}% of your portfolio is in cash. Consider maintaining more in your savings and checking accounts.`,
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
    const stockAssets = assets.filter(asset => asset.type === AssetType.CRYPTO || asset.category === 'Stocks' as AssetCategory);
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
    
    // Insight 4: Asset Concentration
    if (assets.length >= 3) {
      // Find the asset with the highest value
      const highestValueAsset = assets.reduce((max, asset) => {
        const assetValue = asset.currentValue || asset.value || 0;
        const maxValue = max.currentValue || max.value || 0;
        return assetValue > maxValue ? asset : max;
      }, assets[0]);
      
      const highestValue = highestValueAsset.currentValue || highestValueAsset.value || 0;
      const assetConcentration = (highestValue / totalValue) * 100;
      
      // Get the category display name
      const categoryInfo = ASSET_CATEGORIES.find(cat => cat.value === highestValueAsset.category as AssetCategory);
      const categoryDisplayName = categoryInfo ? categoryInfo.label : highestValueAsset.category;
      
      if (assetConcentration > 50) {
        insights.push({
          title: 'High Asset Concentration',
          description: `${assetConcentration.toFixed(1)}% of your portfolio is in a single ${categoryDisplayName.toLowerCase()} asset (${highestValueAsset.name}). Consider diversifying further.`,
          type: 'warning',
          icon: '📈',
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

  // Group insights by category for better organization
  const groupedInsights = insights.reduce((groups, insight) => {
    const category = insight.category || 'general';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(insight);
    return groups;
  }, {} as Record<string, Insight[]>);

  // Order categories for display
  const categoryOrder = ['savings', 'general'];
  
  // Get category display names
  const getCategoryDisplayName = (category: string): string => {
    switch(category.toLowerCase()) {
      case 'savings': return 'Savings Goals';
      default: return 'General Insights';
    }
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
        <div className="space-y-6">
          {/* Display insights by category */}
          {categoryOrder.map(categoryKey => {
            const categoryInsights = groupedInsights[categoryKey] || [];
            if (categoryInsights.length === 0) return null;
            
            return (
              <div key={categoryKey} className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-gray-700 pb-2 text-gray-300">
                  {getCategoryDisplayName(categoryKey)}
                </h3>
                
                {categoryInsights.map((insight, index) => (
                  <div 
                    key={`${insight.title}-${index}`} 
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
            );
          })}
        </div>
      )}
    </div>
  );
}

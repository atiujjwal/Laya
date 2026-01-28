'use client';

import { useQuery } from '@tanstack/react-query';
import { XPData, CategoryBreakdown } from '@/components/organisms/AnalyticsHub';
import { ContributionData } from '@/components/organisms/ContributionGraph';

interface XPStats {
  totalXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  xpInCurrentLevel: number;
}

interface AnalyticsData {
  xpData: XPData[];
  categoryBreakdown: CategoryBreakdown[];
  contributionData: ContributionData[];
  stats: XPStats;
}

const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch analytics');
  }
  return res.json();
};

/**
 * Fetch XP and analytics data
 */
export function useAnalytics(year?: number) {
  const targetYear = year || new Date().getFullYear();
  
  return useQuery<AnalyticsData>({
    queryKey: ['analytics', targetYear],
    queryFn: async () => {
      const raw = await fetcher<AnalyticsData>(`/api/analytics?year=${targetYear}`);

      // Ensure contribution dates are real Date instances for reliable comparisons/highlighting
      const contributionData: ContributionData[] = raw.contributionData.map((item) => ({
        ...item,
        date: new Date(item.date),
      }));

      return { ...raw, contributionData };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch XP statistics
 */
export function useXPStats() {
  return useQuery<XPStats>({
    queryKey: ['xp-stats'],
    queryFn: () => fetcher<XPStats>('/api/analytics/xp-stats'),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Fetch contribution graph data
 */
export function useContributionData(year?: number) {
  const targetYear = year || new Date().getFullYear();
  
  return useQuery<ContributionData[]>({
    queryKey: ['contribution', targetYear],
    queryFn: async () => {
      const raw = await fetcher<ContributionData[]>(`/api/analytics/contribution?year=${targetYear}`);

      // Normalize to Date objects so the graph colors and "today" highlighting work correctly
      return raw.map((item) => ({
        ...item,
        date: new Date(item.date),
      }));
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Fetch XP trend data
 */
export function useXPTrend(days: number = 30) {
  return useQuery<XPData[]>({
    queryKey: ['xp-trend', days],
    queryFn: () => fetcher<XPData[]>(`/api/analytics/xp-trend?days=${days}`),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch category breakdown
 */
export function useCategoryBreakdown() {
  return useQuery<CategoryBreakdown[]>({
    queryKey: ['category-breakdown'],
    queryFn: () => fetcher<CategoryBreakdown[]>('/api/analytics/categories'),
    staleTime: 1000 * 60 * 5,
  });
}

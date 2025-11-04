import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UsageData {
  totalApiCalls: number;
  totalImages: number;
  todayApiCalls: number;
  todayImages: number;
  thisWeekApiCalls: number;
  thisWeekImages: number;
  avgResponseTime: number;
  successRate: number;
  lastUpdated: Date;
}

interface RealtimeUsageHook {
  usage: UsageData;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useRealtimeUsage = (userId?: string): RealtimeUsageHook => {
  const [usage, setUsage] = useState<UsageData>({
    totalApiCalls: 0,
    totalImages: 0,
    todayApiCalls: 0,
    todayImages: 0,
    thisWeekApiCalls: 0,
    thisWeekImages: 0,
    avgResponseTime: 0,
    successRate: 0,
    lastUpdated: new Date(),
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsageData = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Fetch API usage statistics
      const [
        { count: totalApiCalls },
        { count: todayApiCalls },
        { count: thisWeekApiCalls },
        { count: totalImages },
        { count: todayImages },
        { count: thisWeekImages },
        { data: recentApiLogs }
      ] = await Promise.all([
        // Total API calls
        supabase
          .from('api_usage_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId),
        
        // Today's API calls
        supabase
          .from('api_usage_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', today),
        
        // This week's API calls
        supabase
          .from('api_usage_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', weekAgo),
        
        // Total images
        supabase
          .from('image_generation_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId),
        
        // Today's images
        supabase
          .from('image_generation_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', today),
        
        // This week's images
        supabase
          .from('image_generation_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', weekAgo),
        
        // Recent API logs for performance metrics
        supabase
          .from('api_usage_logs')
          .select('response_time, status_code')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(100)
      ]);

      // Calculate performance metrics
      let avgResponseTime = 0;
      let successRate = 0;

      if (recentApiLogs && recentApiLogs.length > 0) {
        // Calculate average response time
        const responseTimes = recentApiLogs
          .filter(log => log.response_time && typeof log.response_time === 'number')
          .map(log => log.response_time as number);
        
        if (responseTimes.length > 0) {
          avgResponseTime = Math.round(
            responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
          );
        }

        // Calculate success rate
        const successfulCalls = recentApiLogs.filter(log => 
          log.status_code >= 200 && log.status_code < 300
        ).length;
        
        successRate = Math.round((successfulCalls / recentApiLogs.length) * 100);
      }

      setUsage({
        totalApiCalls: totalApiCalls || 0,
        totalImages: totalImages || 0,
        todayApiCalls: todayApiCalls || 0,
        todayImages: todayImages || 0,
        thisWeekApiCalls: thisWeekApiCalls || 0,
        thisWeekImages: thisWeekImages || 0,
        avgResponseTime,
        successRate,
        lastUpdated: new Date(),
      });

    } catch (err) {
      console.error('Error fetching usage data:', err);
      setError('Failed to fetch usage statistics');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!userId) return;

    // Initial fetch
    fetchUsageData();

    // Set up real-time subscriptions for API usage logs
    const apiSubscription = supabase
      .channel('api_usage_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'api_usage_logs',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Refresh data when new API usage is logged
          fetchUsageData();
        }
      )
      .subscribe();

    // Set up real-time subscriptions for image generation logs
    const imageSubscription = supabase
      .channel('image_generation_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'image_generation_logs',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Refresh data when new image is generated
          fetchUsageData();
        }
      )
      .subscribe();

    // Set up periodic refresh (every 30 seconds)
    const refreshInterval = setInterval(fetchUsageData, 30000);

    return () => {
      supabase.removeChannel(apiSubscription);
      supabase.removeChannel(imageSubscription);
      clearInterval(refreshInterval);
    };
  }, [userId, fetchUsageData]);

  return {
    usage,
    loading,
    error,
    refresh: fetchUsageData,
  };
};
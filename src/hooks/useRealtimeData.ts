
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface RealtimeStats {
  totalUsers: number;
  totalApiCalls: number;
  promptCalls: number;
  voiceCalls: number;
  recentLogs: any[];
}

export const useRealtimeData = () => {
  const [stats, setStats] = useState<RealtimeStats>({
    totalUsers: 0,
    totalApiCalls: 0,
    promptCalls: 0,
    voiceCalls: 0,
    recentLogs: []
  });

  const fetchStats = async () => {
    try {
      // Get user count
      const { data: userCount } = await supabase.rpc('get_user_count');
      
      // Get total API usage
      const { data: totalCalls } = await supabase.rpc('get_api_usage_count');
      
      // Get prompt calls
      const { data: promptCalls } = await supabase.rpc('get_api_usage_count', {
        request_type_filter: 'prompt'
      });
      
      // Get voice calls
      const { data: voiceCalls } = await supabase.rpc('get_api_usage_count', {
        request_type_filter: 'voice'
      });

      // Get recent logs
      const { data: recentLogs } = await supabase
        .from('api_usage_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setStats({
        totalUsers: userCount || 0,
        totalApiCalls: totalCalls || 0,
        promptCalls: promptCalls || 0,
        voiceCalls: voiceCalls || 0,
        recentLogs: recentLogs || []
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchStats();

    // Set up real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'api_usage_logs'
        },
        () => {
          fetchStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { stats, refreshStats: fetchStats };
};

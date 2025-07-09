
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useApiTracking = () => {
  const logApiUsage = async (
    endpoint: string,
    requestType: 'prompt' | 'voice',
    responseTime?: number,
    statusCode?: number,
    metadata?: any
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Call the database function to log API usage
        await supabase.rpc('log_api_usage', {
          p_user_id: user.id,
          p_user_email: user.email || '',
          p_endpoint: endpoint,
          p_request_type: requestType,
          p_response_time: responseTime,
          p_status_code: statusCode || 200,
          p_metadata: metadata || null
        });

        // Update user usage limits
        await supabase.rpc('update_user_usage', {
          p_user_id: user.id
        });
      }
    } catch (error) {
      console.error('Error logging API usage:', error);
    }
  };

  return { logApiUsage };
};

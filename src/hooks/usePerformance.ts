import { useEffect, useCallback } from 'react';
import { MonitoringService } from '@/lib/monitoring';

export const usePerformance = () => {
  const monitoring = MonitoringService.getInstance();

  // Measure component render time
  const measureRender = useCallback((componentName: string) => {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      if (duration > 16) { // Longer than one frame (60fps)
        monitoring.logPerformance(`${componentName}_render`, duration);
      }
    };
  }, [monitoring]);

  // Track API calls with performance metrics
  const trackApiCall = useCallback(async <T>(
    endpoint: string,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    const start = performance.now();
    let success = false;
    
    try {
      const result = await apiCall();
      success = true;
      return result;
    } catch (error) {
      monitoring.logError(error as Error, { endpoint, type: 'api_error' });
      throw error;
    } finally {
      const duration = performance.now() - start;
      monitoring.trackApiCall(endpoint, duration, success);
    }
  }, [monitoring]);

  // Monitor memory usage
  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = {
          used: Math.round(memory.usedJSHeapSize / 1048576), // MB
          total: Math.round(memory.totalJSHeapSize / 1048576), // MB
          limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
        };

        // Warn if memory usage is high
        if (memoryUsage.used > 100) { // 100MB threshold
          console.warn('High memory usage detected:', memoryUsage);
        }
      }
    };

    const interval = setInterval(checkMemory, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return {
    measureRender,
    trackApiCall,
  };
};
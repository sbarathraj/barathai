// Professional monitoring and error tracking
export class MonitoringService {
  private static instance: MonitoringService;
  private errorQueue: Array<{ error: Error; context: any; timestamp: Date }> = [];

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  // Log errors with context
  logError(error: Error, context: any = {}) {
    const errorEntry = {
      error,
      context: {
        ...context,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date(),
    };

    this.errorQueue.push(errorEntry);
    
    // Send to monitoring service (Sentry, LogRocket, etc.)
    this.sendToMonitoring(errorEntry);
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('BarathAI Error:', errorEntry);
    }
  }

  // Performance monitoring
  measurePerformance(name: string, fn: () => Promise<any>) {
    const start = performance.now();
    
    return fn().finally(() => {
      const duration = performance.now() - start;
      this.logPerformance(name, duration);
    });
  }

  private logPerformance(operation: string, duration: number) {
    if (duration > 1000) { // Log slow operations
      console.warn(`Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`);
    }
  }

  private async sendToMonitoring(errorEntry: any) {
    try {
      // Send to your monitoring service
      // Example: Sentry, LogRocket, custom endpoint
      if (import.meta.env.VITE_SENTRY_DSN) {
        // Sentry integration would go here
      }
    } catch (e) {
      console.error('Failed to send error to monitoring service:', e);
    }
  }

  // API performance tracking
  trackApiCall(endpoint: string, duration: number, success: boolean) {
    const metric = {
      endpoint,
      duration,
      success,
      timestamp: new Date().toISOString(),
    };

    // Send to analytics
    this.sendMetric('api_call', metric);
  }

  private sendMetric(type: string, data: any) {
    // Send to analytics service
    if (import.meta.env.VITE_ANALYTICS_ID) {
      // Analytics integration would go here
    }
  }
}

// Global error handler
export const setupGlobalErrorHandling = () => {
  const monitoring = MonitoringService.getInstance();

  window.addEventListener('error', (event) => {
    monitoring.logError(event.error, {
      type: 'global_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    monitoring.logError(new Error(event.reason), {
      type: 'unhandled_promise_rejection',
    });
  });
};
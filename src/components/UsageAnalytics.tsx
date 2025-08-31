import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRealtimeUsage } from '@/hooks/useRealtimeUsage';
import { 
  Activity, 
  TrendingUp, 
  Zap, 
  Clock, 
  RefreshCw, 
  BarChart3,
  PieChart,
  Calendar,
  Target
} from 'lucide-react';

interface UsageAnalyticsProps {
  userId?: string;
  compact?: boolean;
  showHeader?: boolean;
}

export const UsageAnalytics: React.FC<UsageAnalyticsProps> = ({
  userId,
  compact = false,
  showHeader = true
}) => {
  const { usage, loading, error, refresh } = useRealtimeUsage(userId);

  if (error) {
    return (
      <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <CardContent className="p-4">
          <div className="text-center text-red-600 dark:text-red-400">
            <Activity className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Failed to load usage data</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refresh}
              className="mt-2"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const StatCard = ({ icon: Icon, label, value, trend, color = 'blue' }: {
    icon: any;
    label: string;
    value: string | number;
    trend?: string;
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
      purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
      orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
      red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
    };

    return (
      <div className={`p-3 sm:p-4 rounded-lg border ${colorClasses[color]} transition-all hover:scale-105`}>
        <div className="flex items-center justify-between mb-2">
          <Icon className="w-5 h-5" />
          {trend && (
            <Badge variant="secondary" className="text-xs">
              {trend}
            </Badge>
          )}
        </div>
        <div className="text-2xl font-bold mb-1">{value}</div>
        <div className="text-xs font-medium opacity-80">{label}</div>
      </div>
    );
  };

  if (compact) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Activity}
          label="API Calls"
          value={usage.totalApiCalls.toLocaleString()}
          color="blue"
        />
        <StatCard
          icon={Zap}
          label="Images"
          value={usage.totalImages.toLocaleString()}
          color="purple"
        />
        <StatCard
          icon={Clock}
          label="Avg Time"
          value={`${usage.avgResponseTime}ms`}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          label="Success Rate"
          value={`${usage.successRate}%`}
          color={usage.successRate >= 95 ? 'green' : usage.successRate >= 80 ? 'orange' : 'red'}
        />
      </div>
    );
  }

  return (
    <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-white/30 dark:border-slate-800/40 shadow-xl">
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              Real-time Usage Analytics
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={refresh}
                disabled={loading}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      )}
      
      <CardContent className="space-y-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Activity}
            label="Total API Calls"
            value={usage.totalApiCalls.toLocaleString()}
            color="blue"
          />
          <StatCard
            icon={Zap}
            label="Images Generated"
            value={usage.totalImages.toLocaleString()}
            color="purple"
          />
          <StatCard
            icon={Clock}
            label="Avg Response Time"
            value={`${usage.avgResponseTime}ms`}
            color="green"
          />
          <StatCard
            icon={TrendingUp}
            label="Success Rate"
            value={`${usage.successRate}%`}
            color={usage.successRate >= 95 ? 'green' : usage.successRate >= 80 ? 'orange' : 'red'}
          />
        </div>

        {/* Today's Activity */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Today's Activity
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">API Calls</span>
              </div>
              <Badge variant="secondary">{usage.todayApiCalls}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Images</span>
              </div>
              <Badge variant="secondary">{usage.todayImages}</Badge>
            </div>
          </div>
        </div>

        {/* This Week's Activity */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            This Week's Activity
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">API Calls</span>
              </div>
              <Badge variant="outline">{usage.thisWeekApiCalls}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Images</span>
              </div>
              <Badge variant="outline">{usage.thisWeekImages}</Badge>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Last updated: {usage.lastUpdated.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};
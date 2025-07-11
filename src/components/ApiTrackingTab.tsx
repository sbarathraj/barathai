
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface ApiTrackingTabProps {
  currentUser: any;
}

const ApiTrackingTab: React.FC<ApiTrackingTabProps> = ({ currentUser }) => {
  const [apiLogs, setApiLogs] = useState<any[]>([]);
  const [apiStats, setApiStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [filterUser, setFilterUser] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterApi, setFilterApi] = useState('');

  const isAdmin = currentUser?.email === 'jcibarathraj@gmail.com';

  useEffect(() => {
    if (isAdmin) {
      fetchApiLogs();
      fetchApiStats();
    }
  }, [isAdmin, filterUser, filterDate, filterApi]);

  const fetchApiLogs = async () => {
    setLoading(true);
    let query = supabase
      .from('api_usage_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (filterUser) {
      query = query.ilike('user_email', `%${filterUser}%`);
    }
    if (filterDate) {
      query = query.gte('created_at', filterDate);
    }
    if (filterApi) {
      query = query.eq('api_name', filterApi);
    }

    const { data, error } = await query;
    if (!error && data) {
      setApiLogs(data);
    }
    setLoading(false);
  };

  const fetchApiStats = async () => {
    const { data, error } = await supabase
      .from('api_usage_logs')
      .select('api_name')
      .not('api_name', 'is', null);

    if (!error && data) {
      const stats = data.reduce((acc: any, log: any) => {
        acc[log.api_name] = (acc[log.api_name] || 0) + 1;
        return acc;
      }, {});
      setApiStats(stats);
    }
  };

  const clearFilters = () => {
    setFilterUser('');
    setFilterDate('');
    setFilterApi('');
  };

  if (!isAdmin) {
    return <div className="text-center text-red-500 p-4">Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="space-y-6">
      {/* API Statistics Dashboard */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">API Usage Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(apiStats).map(([apiName, count]) => (
            <div key={apiName} className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 p-4 rounded-lg">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{apiName}</div>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{count as number}</div>
              <div className="text-xs text-slate-500">Total Hits</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Filter API Logs</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">User Email</label>
            <input
              type="text"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              placeholder="Filter by user email..."
              className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Date From</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">API</label>
            <select
              value={filterApi}
              onChange={(e) => setFilterApi(e.target.value)}
              className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm"
            >
              <option value="">All APIs</option>
              <option value="API_1">API 1</option>
              <option value="API_2">API 2</option>
              <option value="OpenRouter_API_1">OpenRouter API 1</option>
              <option value="OpenRouter_API_2">OpenRouter API 2</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={clearFilters} variant="outline" className="w-full">
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* API Logs Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Recent API Logs</h3>
        
        {loading ? (
          <div className="flex justify-center items-center h-32 text-slate-500">Loading API logs...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>API</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Response Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        {log.user_email || 'Anonymous'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.api_name === 'API_1' ? 'bg-blue-100 text-blue-800' :
                        log.api_name === 'API_2' ? 'bg-green-100 text-green-800' :
                        log.api_name === 'OpenRouter_API_1' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {log.api_name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600 dark:text-slate-300 font-mono">
                        {log.endpoint_hit}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {log.request_method}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.status_code >= 200 && log.status_code < 300 ? 'bg-green-100 text-green-800' :
                        log.status_code >= 300 && log.status_code < 400 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {log.status_code}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {log.response_time ? `${log.response_time}ms` : 'N/A'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiTrackingTab;

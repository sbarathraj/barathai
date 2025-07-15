
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import { WorkBook, WorkSheet } from 'xlsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';

interface ApiTrackingTabProps {
  currentUser: any;
}

const ApiTrackingTab: React.FC<ApiTrackingTabProps> = ({ currentUser }) => {
  const [apiLogs, setApiLogs] = useState<any[]>([]);
  const [apiStats, setApiStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [filterUser, setFilterUser] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterApis, setFilterApis] = useState<string[]>(['OpenRouter_API_1', 'OpenRouter_API_2']);
  const [apiOptions, setApiOptions] = useState<string[]>([]);

  const isAdmin = currentUser?.email === 'jcibarathraj@gmail.com';

  // For checkboxes
  const openRouterApis = ['OpenRouter_API_1', 'OpenRouter_API_2'];

  useEffect(() => {
    if (isAdmin) {
      fetchApiLogs();
      fetchApiStats();
      fetchApiOptions();
    }
  }, [isAdmin, filterUser, filterDate, filterApis]);

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
    if (filterApis.length > 0) {
      query = query.in('api_name', filterApis);
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

  const fetchApiOptions = async () => {
    const { data, error } = await supabase
      .from('api_usage_logs')
      .select('api_name')
      .not('api_name', 'is', null);
    if (!error && data) {
      const uniqueApis = Array.from(new Set(data.map((log: any) => log.api_name))).filter(Boolean);
      setApiOptions(uniqueApis);
    }
  };

  const clearFilters = () => {
    setFilterUser('');
    setFilterDate('');
    setFilterApis(['OpenRouter_API_1', 'OpenRouter_API_2']);
  };

  const exportToExcel = async () => {
    // Fetch the full database, not just filtered logs
    const { data: allLogs, error } = await supabase.from('api_usage_logs').select('*');
    if (error || !allLogs) return;
    const data = allLogs.map(log => ({
      ID: log.id,
      Timestamp: log.created_at,
      User: log.user_email,
      API: log.api_name,
      Endpoint: log.endpoint_hit,
      Method: log.request_method,
      Status: log.status_code,
      ResponseTime: log.response_time,
      RequestPayload: typeof log.request_payload === 'object' ? JSON.stringify(log.request_payload) : log.request_payload,
      ResponsePayload: typeof log.response_payload === 'object' ? JSON.stringify(log.response_payload) : log.response_payload
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    // Add colored header row
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
      if (cell) {
        cell.s = {
          fill: { fgColor: { rgb: '60A5FA' } }, // blue
          font: { color: { rgb: 'FFFFFF' }, bold: true },
          alignment: { horizontal: 'center' }
        };
      }
    }
    ws['!cols'] = [
      { wch: 24 }, { wch: 24 }, { wch: 24 }, { wch: 24 }, { wch: 32 }, { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 32 }, { wch: 32 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'API Logs');
    XLSX.writeFile(wb, `api_logs_full_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.xlsx`);
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
          {openRouterApis.map(apiName => (
            <div key={apiName} className="bg-gradient-to-r from-blue-100 to-pink-100 dark:from-slate-700 dark:to-slate-800 p-4 rounded-lg border-2 border-blue-300 dark:border-pink-400">
              <div className="text-base font-bold text-blue-600 dark:text-pink-400 mb-1">{apiName.replace('_', ' ')}</div>
              <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{apiStats[apiName] || 0}</div>
              <div className="text-xs text-slate-500">Total Hits</div>
            </div>
          ))}
          {/* Other APIs, if any */}
          {Object.entries(apiStats).filter(([api]) => !openRouterApis.includes(api)).map(([apiName, count]) => (
            <div key={apiName} className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 p-4 rounded-lg">
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
            <div className="flex flex-col gap-2">
              {openRouterApis.map(api => (
                <label key={api} className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-pink-400">
                  <input
                    type="checkbox"
                    checked={filterApis.includes(api)}
                    onChange={e => {
                      if (e.target.checked) {
                        setFilterApis(prev => [...prev, api]);
                      } else {
                        setFilterApis(prev => prev.filter(a => a !== api));
                      }
                    }}
                    className="accent-blue-500 h-4 w-4 rounded border border-blue-300"
                  />
                  {api.replace('_', ' ')}
                </label>
              ))}
              {/* Other APIs as multi-select */}
              {apiOptions.filter(api => !openRouterApis.includes(api)).length > 0 && (
            <select
                  multiple
                  value={filterApis.filter(api => !openRouterApis.includes(api))}
                  onChange={e => {
                    const options = Array.from(e.target.selectedOptions, option => option.value);
                    setFilterApis(prev => [
                      ...prev.filter(api => openRouterApis.includes(api)),
                      ...options
                    ]);
                  }}
                  className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm h-20 mt-2"
            >
                  {apiOptions.filter(api => !openRouterApis.includes(api)).map(api => (
                    <option key={api} value={api}>{api}</option>
                  ))}
            </select>
              )}
            </div>
          </div>
          <div className="flex items-end">
            <Button onClick={clearFilters} variant="outline" className="w-full">
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* API Logs Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Recent API Logs</h3>
        
        {loading ? (
          <div className="flex justify-center items-center h-32 text-slate-500">Loading API logs...</div>
        ) : (
          <div className="overflow-x-auto w-full">
            <Button
              onClick={exportToExcel}
              className="mb-4 bg-gradient-to-r from-green-400 via-blue-400 to-green-600 text-white font-semibold px-6 py-2 rounded-full shadow-lg flex items-center gap-2 hover:from-green-500 hover:to-blue-500 transition-all duration-200 border-0 w-full sm:w-auto text-base sm:text-lg"
            >
              <FontAwesomeIcon icon={faFileExcel} className="text-white mr-2" />
              Export Full Database to Excel
            </Button>
            <Table className="min-w-[900px] text-xs sm:text-sm md:text-base">
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


import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import { WorkBook, WorkSheet } from 'xlsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { Dialog, DialogContent, DrawerDialogContent } from './ui/dialog';
import { useMediaQuery } from '@/hooks/use-mobile';

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
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const isAdmin = currentUser?.email === 'jcibarathraj@gmail.com';

  // For checkboxes
  const openRouterApis = ['OpenRouter_API_1', 'OpenRouter_API_2'];

  const isDesktop = useMediaQuery('(min-width: 768px)');

  // Calculate datewise count for each API based on all logs for the selected date (not just filtered logs)
  const [allLogsForDate, setAllLogsForDate] = useState<any[]>([]);

  useEffect(() => {
    if (isAdmin) {
      fetchApiLogs();
      fetchApiStats();
      fetchApiOptions();
    }
  }, [isAdmin, filterUser, filterDate, filterApis]);

  useEffect(() => {
    // Fetch all logs for the selected date (no API filter)
    const fetchAllLogsForDate = async () => {
      let query = supabase
        .from('api_usage_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);
      if (filterUser) {
        query = query.ilike('user_email', `%${filterUser}%`);
      }
      if (filterDate) {
        query = query.gte('created_at', filterDate);
      }
      // DO NOT filter by filterApis here!
      const { data, error } = await query;
      if (!error && data) {
        setAllLogsForDate(data);
      } else {
        setAllLogsForDate([]);
      }
    };
    fetchAllLogsForDate();
    // Only depend on filterUser and filterDate, not filterApis
  }, [filterUser, filterDate]);

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
      const uniqueApis = Array.from(new Set([...openRouterApis, ...data.map((log: any) => log.api_name)])).filter(Boolean);
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

  // Calculate datewise count for each API based on all logs for the selected date (not just filtered logs)
  const apiDatewiseCounts = apiOptions.reduce((acc, api) => {
    acc[api] = allLogsForDate.filter(log => log.api_name === api).length;
    return acc;
  }, {} as Record<string, number>);

  if (!isAdmin) {
    return <div className="text-center text-red-500 p-4">Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="space-y-6">
      {/* API Statistics Dashboard */}
      <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl p-4 sm:p-8 shadow-xl border border-white/30 dark:border-slate-800/40 backdrop-blur-xl">
        <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100 bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">API Usage Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {openRouterApis.map(apiName => (
            <div key={apiName} className="bg-gradient-to-r from-blue-100 to-pink-100 dark:from-slate-700 dark:to-slate-800 p-4 rounded-xl border-2 border-blue-300 dark:border-pink-400 shadow flex flex-col items-center">
              <div className="text-base font-bold text-blue-600 dark:text-pink-400 mb-1">{apiName.replace('_', ' ')}</div>
              <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{apiStats[apiName] || 0}</div>
              <div className="text-xs text-slate-500">Total Hits</div>
            </div>
          ))}
          {/* Other APIs, if any */}
          {Object.entries(apiStats).filter(([api]) => !openRouterApis.includes(api)).map(([apiName, count]) => (
            <div key={apiName} className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 p-4 rounded-xl shadow flex flex-col items-center">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{apiName}</div>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{count as number}</div>
              <div className="text-xs text-slate-500">Total Hits</div>
            </div>
          ))}
        </div>
      </div>
      {/* Filters */}
      <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl p-4 sm:p-8 shadow-xl border border-white/30 dark:border-slate-800/40 backdrop-blur-xl flex flex-col md:flex-row md:items-end gap-4 md:gap-8">
        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">User Email</label>
          <input type="text" value={filterUser} onChange={e => setFilterUser(e.target.value)} placeholder="Filter by email" className="border border-blue-300 focus:border-blue-500 rounded px-3 py-2 text-sm outline-none bg-white/80 dark:bg-slate-800/80" />
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Date</label>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="border border-blue-300 focus:border-blue-500 rounded px-3 py-2 text-sm outline-none bg-white/80 dark:bg-slate-800/80" />
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">APIs</label>
          <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
            {apiOptions.map(api => (
              <label key={api} className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-pink-400">
                <input
                  type="checkbox"
                  checked={filterApis.includes(api)}
                  disabled={apiDatewiseCounts[api] === 0}
                  onChange={e => {
                    if (e.target.checked) {
                      setFilterApis(prev => [...prev, api]);
                    } else {
                      setFilterApis(prev => prev.filter(a => a !== api));
                    }
                  }}
                  className="accent-blue-500 h-4 w-4 rounded border border-blue-300"
                />
                {api}
                <span className="ml-1 text-xs text-slate-500">({apiDatewiseCounts[api]})</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex items-end">
          <Button onClick={clearFilters} variant="outline" className="w-full">Clear Filters</Button>
        </div>
      </div>
      {/* API Logs Table */}
      <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl p-4 sm:p-8 shadow-xl border border-white/30 dark:border-slate-800/40 backdrop-blur-xl overflow-x-auto">
        <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100 bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">Recent API Logs</h3>
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
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg">
              <Table className="min-w-[900px] text-xs sm:text-sm md:text-base">
                <TableHeader className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                  <TableRow>
                    <TableHead className="py-3">Timestamp</TableHead>
                    <TableHead className="py-3">User</TableHead>
                    <TableHead className="py-3">API</TableHead>
                    <TableHead className="py-3">Endpoint</TableHead>
                    <TableHead className="py-3">Method</TableHead>
                    <TableHead className="py-3">Status</TableHead>
                    <TableHead className="py-3">Response Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-blue-50/40 dark:hover:bg-pink-900/10 transition-colors cursor-pointer" onClick={() => { setSelectedLog(log); setLogDialogOpen(true); }}>
                      <TableCell>
                        <span className="text-sm text-slate-600 dark:text-slate-300">{new Date(log.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{log.user_email || 'Anonymous'}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          log.api_name === 'API_1' ? 'bg-blue-100 text-blue-800' :
                          log.api_name === 'API_2' ? 'bg-green-100 text-green-800' :
                          log.api_name === 'OpenRouter_API_1' ? 'bg-purple-100 text-purple-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>{log.api_name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600 dark:text-slate-300 font-mono">{log.endpoint_hit}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600 dark:text-slate-300">{log.request_method}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600 dark:text-slate-300">{log.status_code}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600 dark:text-slate-300">{log.response_time}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
      {/* Log Details Dialog/Drawer for mobile/desktop */}
      <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
        <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto">
          {selectedLog && (
            <div className="p-6 w-full mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl flex flex-col gap-4">
              <h2 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-100">API Log Details</h2>
              <div className="flex flex-col gap-2">
                <div><span className="font-semibold">Timestamp:</span> {new Date(selectedLog.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                <div><span className="font-semibold">User:</span> {selectedLog.user_email || 'Anonymous'}</div>
                <div><span className="font-semibold">API:</span> {selectedLog.api_name}</div>
                <div><span className="font-semibold">Endpoint:</span> {selectedLog.endpoint_hit}</div>
                <div><span className="font-semibold">Method:</span> {selectedLog.request_method}</div>
                <div><span className="font-semibold">Status:</span> {selectedLog.status_code}</div>
                <div><span className="font-semibold">Response Time:</span> {selectedLog.response_time}</div>
                <div><span className="font-semibold">Request Payload:</span> <pre className="bg-slate-100 dark:bg-slate-800 rounded p-2 text-sm overflow-x-auto">{JSON.stringify(selectedLog.request_payload, null, 2)}</pre></div>
                <div><span className="font-semibold">Response Payload:</span> <pre className="bg-slate-100 dark:bg-slate-800 rounded p-2 text-sm overflow-x-auto">{JSON.stringify(selectedLog.response_payload, null, 2)}</pre></div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => setLogDialogOpen(false)} className="flex-1">Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApiTrackingTab;

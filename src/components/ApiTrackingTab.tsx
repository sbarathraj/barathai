
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel, faChartBar } from '@fortawesome/free-solid-svg-icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

interface ApiTrackingTabProps {
  currentUser: any;
}

const ApiTrackingTab: React.FC<ApiTrackingTabProps> = ({ currentUser }) => {
  const [apiLogs, setApiLogs] = useState<any[]>([]);
  const [apiStats, setApiStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [filterUser, setFilterUser] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterApis, setFilterApis] = useState<string[]>(['OpenRouter_API_1', 'OpenRouter_API_2']);
  const [apiOptions, setApiOptions] = useState<string[]>([]);
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  const isAdmin = currentUser?.email === 'jcibarathraj@gmail.com';

  // For checkboxes
  const openRouterApis = ['OpenRouter_API_1', 'OpenRouter_API_2'];



  // Calculate datewise count for each API based on all logs for the selected date (not just filtered logs)
  const [allLogsForDate, setAllLogsForDate] = useState<any[]>([]);

  useEffect(() => {
    if (isAdmin) {
      fetchApiLogs();
      fetchApiStats();
      fetchApiOptions();
    }
  }, [isAdmin, filterUser, startDate, endDate, filterApis, currentPage]);

  useEffect(() => {
    // Fetch all logs for the selected date range (no API filter) - optimized
    const fetchAllLogsForDate = async () => {
      let query = supabase
        .from('api_usage_logs')
        .select('api_name, created_at')
        .order('created_at', { ascending: false })
        .limit(500);
      if (filterUser) {
        query = query.ilike('user_email', `%${filterUser}%`);
      }
      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endDateTime.toISOString());
      }
      const { data, error } = await query;
      if (!error && data) {
        setAllLogsForDate(data);
      } else {
        setAllLogsForDate([]);
      }
    };
    fetchAllLogsForDate();
  }, [filterUser, startDate, endDate]);

  const fetchApiLogs = async () => {
    setLoading(true);
    
    // First get total count for pagination
    let countQuery = supabase
      .from('api_usage_logs')
      .select('*', { count: 'exact', head: true });
    
    if (filterUser) {
      countQuery = countQuery.ilike('user_email', `%${filterUser}%`);
    }
    if (startDate) {
      countQuery = countQuery.gte('created_at', startDate);
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      countQuery = countQuery.lte('created_at', endDateTime.toISOString());
    }
    if (filterApis.length > 0) {
      countQuery = countQuery.in('api_name', filterApis);
    }
    
    const { count } = await countQuery;
    setTotalItems(count || 0);
    
    // Then get paginated data
    let query = supabase
      .from('api_usage_logs')
      .select('id, created_at, user_email, api_name, endpoint_hit, request_method, status_code, response_time, request_payload, response_payload')
      .order('created_at', { ascending: false })
      .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

    if (filterUser) {
      query = query.ilike('user_email', `%${filterUser}%`);
    }
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      query = query.lte('created_at', endDateTime.toISOString());
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
    // Regular query for API stats
    const { data, error } = await supabase
      .from('api_usage_logs')
      .select('api_name')
      .not('api_name', 'is', null)
      .limit(1000);

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
    setStartDate('');
    setEndDate('');
    setFilterApis(['OpenRouter_API_1', 'OpenRouter_API_2']);
    setCurrentPage(1);
  };

  const exportToExcel = async () => {
    // Fetch filtered data for export
    let query = supabase.from('api_usage_logs').select('*').order('created_at', { ascending: false });
    
    if (filterUser) {
      query = query.ilike('user_email', `%${filterUser}%`);
    }
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      query = query.lte('created_at', endDateTime.toISOString());
    }
    if (filterApis.length > 0) {
      query = query.in('api_name', filterApis);
    }
    
    const { data: allLogs, error } = await query;
    if (error || !allLogs) return;
    
    const formatDateTime = (iso: string) => {
      if (!iso) return '-';
      const d = new Date(iso);
      return d.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    };
    
    const data = allLogs.map(log => ({
      ID: log.id,
      Timestamp: formatDateTime(log.created_at),
      UserEmail: log.user_email,
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
    
    const dateRange = startDate || endDate ? `_${startDate || 'start'}_to_${endDate || 'end'}` : '';
    XLSX.writeFile(wb, `api_logs${dateRange}_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.xlsx`);
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
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
            <FontAwesomeIcon icon={faChartBar} className="text-white text-lg" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">API Usage Analytics</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Real-time monitoring and performance metrics</p>
          </div>
        </div>
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
      <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl p-4 sm:p-8 shadow-xl border border-white/30 dark:border-slate-800/40 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Advanced Filters</h3>
        </div>
        <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-8">
        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">User Email</label>
          <input type="text" value={filterUser} onChange={e => setFilterUser(e.target.value)} placeholder="Filter by email" className="border border-blue-300 focus:border-blue-500 rounded px-3 py-2 text-sm outline-none bg-white/80 dark:bg-slate-800/80" />
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/6">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Start Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border border-blue-300 focus:border-blue-500 rounded px-3 py-2 text-sm outline-none bg-white/80 dark:bg-slate-800/80" />
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/6">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">End Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border border-blue-300 focus:border-blue-500 rounded px-3 py-2 text-sm outline-none bg-white/80 dark:bg-slate-800/80" />
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
          <Button onClick={clearFilters} variant="outline" className="w-full bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-600 dark:hover:to-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold">Clear All Filters</Button>
        </div>
        </div>
      </div>
      {/* API Logs Table */}
      <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl p-4 sm:p-8 shadow-xl border border-white/30 dark:border-slate-800/40 backdrop-blur-xl overflow-x-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
              <FontAwesomeIcon icon={faChartBar} className="text-white text-sm" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Recent API Logs</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Detailed request and response tracking</p>
            </div>
          </div>
        </div>
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
                    <TableHead className="py-3">Sno</TableHead>
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
                  {apiLogs.map((log, index) => (
                    <TableRow key={log.id} className="hover:bg-blue-50/40 dark:hover:bg-pink-900/10 transition-colors cursor-pointer" onClick={() => { setSelectedLog(log); setLogDialogOpen(true); }}>
                      <TableCell>
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600 dark:text-slate-300 font-mono">
                          {new Date(log.created_at).toLocaleDateString('en-GB', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                          })}
                        </span>
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
            
            {/* Pagination */}
            {totalItems > itemsPerPage && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} logs
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Page {currentPage} of {Math.ceil(totalItems / itemsPerPage)}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalItems / itemsPerPage)))}
                    disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Log Details Dialog/Drawer for mobile/desktop */}
      <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>API Log Details</DialogTitle>
            <DialogDescription>
              Complete details for the selected API log entry including request/response data.
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              {/* API Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Timestamp</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{new Date(selectedLog.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">User Email</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{selectedLog.user_email || 'Anonymous'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">API Service</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{selectedLog.api_name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Endpoint</span>
                    <span className="text-sm font-mono text-slate-700 dark:text-slate-300 break-all">{selectedLog.endpoint_hit}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Method</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{selectedLog.request_method}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status Code</span>
                    <span className={`text-sm font-bold ${selectedLog.status_code >= 200 && selectedLog.status_code < 300 ? 'text-green-600 dark:text-green-400' : selectedLog.status_code >= 400 ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                      {selectedLog.status_code}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Response Time</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{selectedLog.response_time}</span>
                  </div>
                </div>
              </div>

              {/* Request Payload */}
              <div className="space-y-2">
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
                  Request Payload
                </h4>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <pre className="p-4 text-sm overflow-auto max-h-64 text-slate-700 dark:text-slate-300 font-mono leading-relaxed">
                    {JSON.stringify(selectedLog.request_payload, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Response Payload */}
              <div className="space-y-2">
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                  Response Payload
                </h4>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <pre className="p-4 text-sm overflow-auto max-h-64 text-slate-700 dark:text-slate-300 font-mono leading-relaxed">
                    {JSON.stringify(selectedLog.response_payload, null, 2)}
                  </pre>
                </div>
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

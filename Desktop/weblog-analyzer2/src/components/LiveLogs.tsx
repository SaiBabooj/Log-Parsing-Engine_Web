import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket, LogEntry } from '../lib/socket';
import LogTable from './LogTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Activity, Shield, Zap, Download } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { toast } from 'sonner';

export default function LiveLogs() {
  const { token } = useAuth();
  const { socket, isConnected } = useSocket(token);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/logs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setLogs(data.slice(0, 200));
        }
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      }
    };

    fetchLogs();
  }, [token]);

  useEffect(() => {
    if (!socket) return;

    socket.on('log:new', (log: LogEntry) => {
      setLogs(prev => [log, ...prev].slice(0, 200));
    });

    socket.on('logs:batch', (newLogs: LogEntry[]) => {
      setLogs(prev => [...newLogs, ...prev].slice(0, 200));
    });

    return () => {
      socket.off('log:new');
      socket.off('logs:batch');
    };
  }, [socket]);

  const handleExport = () => {
    if (logs.length === 0) {
      toast.error('No logs available to export');
      return;
    }

    const headers = ['Timestamp', 'Method', 'Path', 'Status', 'Latency', 'IP', 'User Agent'];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        log.timestamp,
        log.method,
        log.path,
        log.status,
        `${log.responseTime}ms`,
        log.ip,
        `"${log.userAgent.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `live_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Logs exported successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Log Stream</h1>
          <p className="text-muted-foreground">Real-time monitoring of server activity and requests.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Badge variant={isConnected ? "default" : "destructive"} className="px-3 py-1 gap-1.5">
            <div className={Number(isConnected) ? "h-2 w-2 rounded-full bg-green-500 animate-pulse" : "h-2 w-2 rounded-full bg-red-500"} />
            {isConnected ? 'Live Connection' : 'Disconnected'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Stream Speed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">~12 req/s</div>
            <p className="text-xs text-muted-foreground mt-1">Current ingestion rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              Security Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">No threats detected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-orange-500" />
              Buffer Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Cached entries in view</p>
          </CardContent>
        </Card>
      </div>

      <Card className="flex-1 min-h-[600px] flex flex-col">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Console Output</CardTitle>
              <CardDescription>Raw log data as it arrives from the server</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1">
          <LogTable logs={logs} />
        </CardContent>
      </Card>
    </div>
  );
}

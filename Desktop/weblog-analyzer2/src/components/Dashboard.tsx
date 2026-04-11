import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket, LogEntry } from '../lib/socket';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { 
  Activity, 
  Users, 
  AlertCircle, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download,
  RefreshCw,
  FileUp
} from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import LogTable from './LogTable';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import Upload from './Upload';
import { toast } from 'sonner';

interface Stats {
  totalRequests: number;
  errorCount: number;
  uniqueIps: number;
  avgResponseTime: number;
  topEndpoints: { path: string; count: number }[];
}

export default function Dashboard() {
  const { token } = useAuth();
  const { socket, isConnected } = useSocket(token);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<{ time: string; count: number }[]>([]);

  useEffect(() => {
    fetchStats();
    fetchLogs();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('log:new', (log: LogEntry) => {
      setLogs(prev => [log, ...prev].slice(0, 100));
      updateChartData();
    });

    socket.on('logs:batch', (newLogs: LogEntry[]) => {
      setLogs(prev => [...newLogs, ...prev].slice(0, 100));
      fetchStats();
    });

    return () => {
      socket.off('log:new');
      socket.off('logs:batch');
    };
  }, [socket]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setLogs(data.slice(0, 100));
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  const updateChartData = () => {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setChartData(prev => {
      const newData = [...prev, { time, count: Math.floor(Math.random() * 20) + 5 }];
      return newData.slice(-20);
    });
  };

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
    link.setAttribute('download', `weblog_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported successfully');
  };

  const StatCard = ({ title, value, icon: Icon, description, trend, trendValue }: any) => (
    <Card className="overflow-hidden border-2 transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-3xl font-bold mt-1">{value}</h3>
          </div>
          <div className="p-3 bg-primary/10 rounded-xl">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          {trend === 'up' ? (
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-none gap-1">
              <ArrowUpRight className="h-3 w-3" /> {trendValue}%
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-none gap-1">
              <ArrowDownRight className="h-3 w-3" /> {trendValue}%
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">{description}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            Real-time monitoring of your server infrastructure
            <Badge variant={isConnected ? "secondary" : "destructive"} className="ml-2 gap-1.5">
              <span className={cn("h-1.5 w-1.5 rounded-full", isConnected ? "bg-emerald-500 animate-pulse" : "bg-white")}></span>
              {isConnected ? "Live Connection" : "Disconnected"}
            </Badge>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2" onClick={fetchStats}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button size="sm" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Requests" 
          value={stats?.totalRequests || 0} 
          icon={Activity} 
          description="Last 24 hours"
          trend="up"
          trendValue="12.5"
        />
        <StatCard 
          title="Error Rate" 
          value={`${((stats?.errorCount || 0) / (stats?.totalRequests || 1) * 100).toFixed(1)}%`} 
          icon={AlertCircle} 
          description="Critical issues"
          trend="down"
          trendValue="3.2"
        />
        <StatCard 
          title="Unique Visitors" 
          value={stats?.uniqueIps || 0} 
          icon={Users} 
          description="Distinct IPs"
          trend="up"
          trendValue="8.4"
        />
        <StatCard 
          title="Avg. Latency" 
          value={`${stats?.avgResponseTime || 0}ms`} 
          icon={Clock} 
          description="Response time"
          trend="down"
          trendValue="15.7"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Request Volume</CardTitle>
              <CardDescription>Real-time traffic distribution</CardDescription>
            </div>
            <Tabs defaultValue="1h">
              <TabsList className="h-8">
                <TabsTrigger value="1h" className="text-xs">1h</TabsTrigger>
                <TabsTrigger value="24h" className="text-xs">24h</TabsTrigger>
                <TabsTrigger value="7d" className="text-xs">7d</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="h-[350px] pl-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgba(255, 255, 255, 0.8)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="rgba(255, 255, 255, 0)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.2)" opacity={0.2} />
                <XAxis 
                  dataKey="time" 
                  stroke="rgba(255, 255, 255, 0.6)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  minTickGap={30}
                />
                <YAxis 
                  stroke="rgba(255, 255, 255, 0.6)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="rgba(255, 255, 255, 0.9)" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-2">
          <CardHeader>
            <CardTitle>Top Endpoints</CardTitle>
            <CardDescription>Most accessed API routes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stats?.topEndpoints.map((endpoint, i) => (
                <div key={endpoint.path} className="flex items-center">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </div>
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium leading-none">{endpoint.path}</p>
                      <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                        <div 
                          className="bg-primary rounded-full h-1.5 transition-all duration-1000" 
                          style={{ width: `${(endpoint.count / (stats?.topEndpoints[0]?.count || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 text-sm font-bold">
                    {endpoint.count}
                  </div>
                </div>
              ))}
              {!stats?.topEndpoints.length && (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                  <Activity className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm">No data available yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="live" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="border-2">
            <TabsTrigger value="live" className="gap-2">
              <Activity className="h-4 w-4" /> Live Stream
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <FileUp className="h-4 w-4" /> Upload Logs
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </div>
        </div>
        <TabsContent value="live" className="mt-0">
          <LogTable logs={logs} />
        </TabsContent>
        <TabsContent value="upload" className="mt-0">
          <Upload onUploadSuccess={fetchStats} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

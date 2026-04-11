import React from 'react';
import { LogEntry } from '../lib/socket';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface LogTableProps {
  logs: LogEntry[];
}

export default function LogTable({ logs }: LogTableProps) {
  const getStatusColor = (status: number) => {
    if (status >= 500) return "bg-rose-500/10 text-rose-600 border-rose-200";
    if (status >= 400) return "bg-amber-500/10 text-amber-600 border-amber-200";
    if (status >= 300) return "bg-blue-500/10 text-blue-600 border-blue-200";
    return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return "text-blue-600 bg-blue-50";
      case 'POST': return "text-emerald-600 bg-emerald-50";
      case 'PUT': return "text-amber-600 bg-amber-50";
      case 'DELETE': return "text-rose-600 bg-rose-50";
      default: return "text-slate-600 bg-slate-50";
    }
  };

  return (
    <div className="rounded-xl border-2 bg-card overflow-hidden">
      <ScrollArea className="h-[600px]">
        <Table>
          <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
            <TableRow>
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead className="w-[80px]">Method</TableHead>
              <TableHead>Path</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[100px]">Latency</TableHead>
              <TableHead className="w-[140px]">IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} className="group hover:bg-muted/30 transition-colors">
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {format(new Date(log.timestamp), 'HH:mm:ss.SSS')}
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold tracking-wider",
                    getMethodColor(log.method)
                  )}>
                    {log.method}
                  </span>
                </TableCell>
                <TableCell className="font-medium max-w-[300px] truncate">
                  {log.path}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("font-bold", getStatusColor(log.status))}>
                    {log.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "text-xs font-medium",
                    log.responseTime > 300 ? "text-rose-500" : 
                    log.responseTime > 100 ? "text-amber-500" : 
                    "text-emerald-500"
                  )}>
                    {log.responseTime}ms
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {log.ip}
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Waiting for incoming logs...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}

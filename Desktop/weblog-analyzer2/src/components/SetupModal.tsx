import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Shield, Server, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SetupModal({ onComplete }: { onComplete: () => void }) {
  const { token } = useAuth();
  const [mode, setMode] = useState<'simulated' | 'real'>('simulated');
  const [logPath, setLogPath] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const logSource = mode === 'simulated' ? 'simulated' : logPath;

    try {
      const response = await fetch('/api/config/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ logSource }),
      });

      if (response.ok) {
        toast.success('System configuration complete');
        onComplete();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to update configuration');
      }
    } catch (error) {
      toast.error('An error occurred during setup');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg shadow-2xl border-2 animate-in zoom-in duration-300">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">First-Time Setup</CardTitle>
          <CardDescription>
            Welcome to WebLog Analyzer. Please configure your log source to begin monitoring.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Select Log Source</Label>
              <div className="grid grid-cols-1 gap-4">
                <div 
                  className={`relative flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${mode === 'simulated' ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground'}`}
                  onClick={() => setMode('simulated')}
                >
                  <Server className={`h-5 w-5 mt-0.5 ${mode === 'simulated' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="flex-1">
                    <p className="font-medium">Simulated Logs (Demo Mode)</p>
                    <p className="text-sm text-muted-foreground">Generates mock traffic data for testing and demonstration.</p>
                  </div>
                  <div className={`h-4 w-4 rounded-full border-2 mt-1 ${mode === 'simulated' ? 'border-primary bg-primary' : 'border-muted'}`}>
                    {mode === 'simulated' && <div className="h-1.5 w-1.5 m-0.5 rounded-full bg-white" />}
                  </div>
                </div>

                <div 
                  className={`relative flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${mode === 'real' ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground'}`}
                  onClick={() => setMode('real')}
                >
                  <FileText className={`h-5 w-5 mt-0.5 ${mode === 'real' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="flex-1">
                    <p className="font-medium">Real System Logs</p>
                    <p className="text-sm text-muted-foreground">Access live logs directly from your device's file system.</p>
                  </div>
                  <div className={`h-4 w-4 rounded-full border-2 mt-1 ${mode === 'real' ? 'border-primary bg-primary' : 'border-muted'}`}>
                    {mode === 'real' && <div className="h-1.5 w-1.5 m-0.5 rounded-full bg-white" />}
                  </div>
                </div>
              </div>
            </div>

            {mode === 'real' && (
              <div className="space-y-3 animate-in slide-in-from-top duration-300">
                <Label htmlFor="log-path">Log File Path</Label>
                <Input 
                  id="log-path" 
                  placeholder="/var/log/nginx/access.log" 
                  value={logPath}
                  onChange={(e) => setLogPath(e.target.value)}
                  required={mode === 'real'}
                />
                <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-md border border-amber-500/20">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700">
                    Ensure the application has read permissions for this file path.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full h-11" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Configuring System...
                </>
              ) : (
                'Start Monitoring'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

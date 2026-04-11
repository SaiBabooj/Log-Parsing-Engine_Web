import React from 'react';
import Upload from './Upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { FileUp, Info } from 'lucide-react';

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Logs</h1>
        <p className="text-muted-foreground">Import historical log files for analysis and visualization.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Upload onUploadSuccess={() => {}} />
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                Supported Formats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-1">
                <p className="font-medium">Apache/Nginx Logs</p>
                <p className="text-muted-foreground">Standard combined or common log formats.</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium">JSON Logs</p>
                <p className="text-muted-foreground">Structured logs in JSON format per line.</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium">Plain Text</p>
                <p className="text-muted-foreground">Generic text files with timestamped entries.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Upload Limits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max File Size:</span>
                <span className="font-medium">50 MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Entries:</span>
                <span className="font-medium">100,000</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { FileUp, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

interface UploadProps {
  onUploadSuccess: () => void;
}

export default function Upload({ onUploadSuccess }: UploadProps) {
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.log') || droppedFile.name.endsWith('.txt')) {
      setFile(droppedFile);
    } else {
      toast.error('Please upload a .log or .txt file');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    try {
      const response = await fetch('/api/logs/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      clearInterval(interval);
      setProgress(100);

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        onUploadSuccess();
        setFile(null);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Upload failed');
      }
    } catch (error) {
      toast.error('An error occurred during upload');
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <Card className="border-2 border-dashed bg-muted/30">
      <CardContent className="p-12">
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={cn(
            "flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-12 transition-all duration-200",
            isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-muted-foreground/20",
            file ? "bg-background border-solid" : ""
          )}
        >
          {!file ? (
            <>
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <FileUp className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Upload Log File</h3>
              <p className="text-muted-foreground text-center max-w-xs mb-6">
                Drag and drop your server log files here, or click to browse.
                Supports .log and .txt formats.
              </p>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".log,.txt"
                />
                <Button onClick={() => document.getElementById('file-upload')?.click()}>
                  Select File
                </Button>
              </div>
            </>
          ) : (
            <div className="w-full max-w-md space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted rounded-xl border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                {!isUploading && (
                  <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  className="flex-1 h-11" 
                  onClick={handleUpload} 
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Confirm Upload
                    </>
                  )}
                </Button>
                {!isUploading && (
                  <Button variant="outline" className="h-11" onClick={() => setFile(null)}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

# Real-Time System Log Analysis Guide

This guide explains how to transition from the built-in simulation to analyzing real system logs.

## 1. Current Simulation Mode
By default, the application runs a **Log Simulator** located in `server.ts`. This is designed for demonstration purposes and generates a mock request every 2 seconds.

## 2. Analyzing Real Logs (Manual)
To analyze existing log files from your system:
1. Navigate to the **"Upload Logs"** page in the application.
2. Drag and drop your `.log` or `.txt` files (e.g., Nginx `access.log` or Apache logs).
3. The system will parse the timestamps, methods, paths, and status codes to populate the dashboard.

## 3. Setting Up Real-Time System Integration
To stream live logs from your actual local system instead of the simulator, follow these steps:

### Option A: Node.js File Watcher (Recommended)
You can modify the `server.ts` to watch a specific log file on your disk using the `tail` library:
1. Install the tail package: `npm install tail`
2. Update the Socket.IO connection block:
   ```typescript
   import { Tail } from 'tail';
   
   const logTail = new Tail("/path/to/your/system/access.log");
   
   logTail.on("line", (data) => {
     // 1. Parse the 'data' string into a LogEntry object
     // 2. io.emit('log:new', parsedLog);
   });
   ```

### Option B: Express Middleware
If you are using this project as a wrapper for your own API, you can log real traffic by adding a middleware:
```typescript
app.use((req, res, next) => {
  res.on('finish', () => {
    const logEntry = {
      id: uuid(),
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      // ... other fields
    };
    io.emit('log:new', logEntry);
  });
  next();
});
```

## 4. Security Considerations
- **PII Scrubbing**: Ensure your log parser removes sensitive information (like passwords in query strings) before emitting logs to the frontend.
- **Access Control**: Only authorized administrators should have access to the Live Stream, as logs can contain sensitive infrastructure metadata.

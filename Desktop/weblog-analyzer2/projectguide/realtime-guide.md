# Real-Time System Log Analysis Guide

This guide explains how to transition from the built-in simulation to analyzing real system logs.

## 1. Current Simulation Mode
By default, the application runs a **Log Simulator** located in `server.ts`. This is designed for demonstration purposes and generates a mock request every 2 seconds.

## 2. Analyzing Real Logs (Manual)
To analyze existing log files from your system:
1. Navigate to the **"Upload Logs"** page in the application.
2. Drag and drop your `.log` or `.txt` files (e.g., Nginx `access.log` or Apache logs).
3. The system will parse the timestamps, methods, paths, and status codes to populate the dashboard.

## 3. Setting Up Real-Time System Integration (Automated)

The application now includes a built-in mechanism to connect to real system logs without manual code changes.

### First-Time Setup Flow
1. **Login**: Access the application with your admin credentials.
2. **Configuration Modal**: On your first run, a setup wizard will appear automatically.
3. **Choose "Real System Logs"**: Select this option to enable live tailing of local files.
4. **Provide File Path**: Enter the absolute path to your log file:
   - **Windows**: `C:\nginx\logs\access.log`
   - **Linux**: `/var/log/nginx/access.log`
   - **macOS**: `/usr/local/var/log/nginx/access.log` (Homebrew) or `/var/log/apache2/access_log` (Built-in Apache).
5. **Start Monitoring**: The system will instantly switch from simulation to live-tailing your specified file.

### macOS Specific Notes
- **Permissions**: macOS often restricts access to system folders. You may need to grant **Full Disk Access** to your terminal or IDE (like VS Code) in *System Settings > Privacy & Security* to allow the Node.js process to read files in `/var/log`.
- **Homebrew Paths**: If you installed Nginx via Homebrew, your logs are typically located at `/usr/local/var/log/nginx/` (Intel Mac) or `/opt/homebrew/var/log/nginx/` (Apple Silicon).

### How it Works
The backend uses the `tail` library to monitor the file for changes. When a new line is appended to your local log file:
1. The server detects the change.
2. It parses the line using a standard web log regex.
3. It broadcasts the new log entry to all connected clients via WebSockets.

### Manual Reconfiguration
If you need to change the log source after the initial setup:
1. Delete the `config.json` file in the project root.
2. Restart the server.
3. The setup wizard will reappear on your next login.

## 4. Security Considerations
- **PII Scrubbing**: Ensure your log parser removes sensitive information (like passwords in query strings) before emitting logs to the frontend.
- **Access Control**: Only authorized administrators should have access to the Live Stream, as logs can contain sensitive infrastructure metadata.

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import { Tail } from 'tail';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.join(__dirname, 'config.json');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const PORT = 3000;

// Load or initialize config
let config = {
  logSource: 'simulated', // 'simulated' or a file path
  isFirstRun: true
};

if (fs.existsSync(CONFIG_PATH)) {
  try {
    config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (e) {
    console.error('Failed to parse config.json, using defaults');
  }
}

const saveConfig = () => {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
};

const MOCK_USER = {
  id: '1',
  email: 'admin@kluniversity.in',
  password: bcrypt.hashSync('admin', 10),
};

interface LogEntry {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  status: number;
  responseTime: number;
  ip: string;
  userAgent: string;
}

let logs: LogEntry[] = [];
const MAX_LOGS = 1000;
let activeTail: any = null;
let simulationInterval: any = null;

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  });

  app.use(express.json());

  // Log Source Management
  const startLogSource = () => {
    // Clear existing
    if (activeTail) {
      activeTail.unwatch();
      activeTail = null;
    }
    if (simulationInterval) {
      clearInterval(simulationInterval);
      simulationInterval = null;
    }

    if (config.logSource === 'simulated') {
      console.log('Starting log simulation...');
      simulationInterval = setInterval(() => {
        const methods = ['GET', 'POST', 'PUT', 'DELETE'];
        const paths = ['/api/users', '/api/products', '/api/orders', '/api/auth/login', '/api/stats', '/dashboard', '/settings'];
        const statuses = [200, 200, 200, 201, 400, 401, 404, 500];
        
        const newLog: LogEntry = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
          method: methods[Math.floor(Math.random() * methods.length)],
          path: paths[Math.floor(Math.random() * paths.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          responseTime: Math.floor(Math.random() * 500) + 10,
          ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        };

        logs.unshift(newLog);
        if (logs.length > MAX_LOGS) logs.pop();
        io.emit('log:new', newLog);
      }, 2000);
    } else {
      console.log(`Tailing real log file: ${config.logSource}`);
      try {
        if (!fs.existsSync(config.logSource)) {
          throw new Error('File not found');
        }
        activeTail = new Tail(config.logSource);
        activeTail.on("line", (line: string) => {
          // Simple parser for common log format
          // [timestamp] METHOD PATH STATUS LATENCYms IP "USERAGENT"
          const match = line.match(/\[(.*?)\] (\w+) (.*?) (\d+) (\d+)ms (.*?) "(.*?)"/);
          if (match) {
            const newLog: LogEntry = {
              id: Math.random().toString(36).substr(2, 9),
              timestamp: match[1],
              method: match[2],
              path: match[3],
              status: parseInt(match[4]),
              responseTime: parseInt(match[5]),
              ip: match[6],
              userAgent: match[7],
            };
            logs.unshift(newLog);
            if (logs.length > MAX_LOGS) logs.pop();
            io.emit('log:new', newLog);
          }
        });
        activeTail.on("error", (error: any) => {
          console.error('Tail error:', error);
        });
      } catch (err) {
        console.error('Failed to start tail:', err);
        config.logSource = 'simulated';
        saveConfig();
        startLogSource();
      }
    }
  };

  startLogSource();

  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (email === MOCK_USER.email && bcrypt.compareSync(password, MOCK_USER.password)) {
      const token = jwt.sign({ id: MOCK_USER.id, email: MOCK_USER.email }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user: { id: MOCK_USER.id, email: MOCK_USER.email } });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });

  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    res.json({ user: req.user });
  });

  // Config Routes
  app.get('/api/config', authenticateToken, (req, res) => {
    res.json(config);
  });

  app.post('/api/config/setup', authenticateToken, (req, res) => {
    const { logSource } = req.body;
    
    if (logSource !== 'simulated' && !fs.existsSync(logSource)) {
      return res.status(400).json({ message: 'Log file path does not exist on the server.' });
    }

    config.logSource = logSource;
    config.isFirstRun = false;
    saveConfig();
    startLogSource();
    
    res.json({ message: 'Configuration updated successfully', config });
  });

  app.get('/api/logs', authenticateToken, (req, res) => {
    res.json(logs);
  });

  app.get('/api/stats', authenticateToken, (req, res) => {
    const totalRequests = logs.length;
    const errorCount = logs.filter(l => l.status >= 400).length;
    const uniqueIps = new Set(logs.map(l => l.ip)).size;
    const avgResponseTime = logs.length > 0 ? logs.reduce((acc, l) => acc + l.responseTime, 0) / logs.length : 0;

    const endpoints: Record<string, number> = {};
    logs.forEach(l => {
      endpoints[l.path] = (endpoints[l.path] || 0) + 1;
    });
    const topEndpoints = Object.entries(endpoints)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([path, count]) => ({ path, count }));

    res.json({
      totalRequests,
      errorCount,
      uniqueIps,
      avgResponseTime: Math.round(avgResponseTime),
      topEndpoints,
    });
  });

  const upload = multer({ dest: 'uploads/' });
  app.post('/api/logs/upload', authenticateToken, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    try {
      const content = fs.readFileSync(req.file.path, 'utf8');
      const lines = content.split('\n');
      const newLogs: LogEntry[] = [];

      lines.forEach(line => {
        if (!line.trim()) return;
        const match = line.match(/\[(.*?)\] (\w+) (.*?) (\d+) (\d+)ms (.*?) "(.*?)"/);
        if (match) {
          newLogs.push({
            id: Math.random().toString(36).substr(2, 9),
            timestamp: match[1],
            method: match[2],
            path: match[3],
            status: parseInt(match[4]),
            responseTime: parseInt(match[5]),
            ip: match[6],
            userAgent: match[7],
          });
        }
      });

      logs = [...newLogs, ...logs].slice(0, MAX_LOGS);
      io.emit('logs:batch', newLogs);
      
      fs.unlinkSync(req.file.path);
      
      res.json({ message: `Successfully processed ${newLogs.length} logs`, count: newLogs.length });
    } catch (error) {
      res.status(500).json({ message: 'Error processing file' });
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected');
    
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

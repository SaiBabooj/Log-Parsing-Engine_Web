# WebLog Analyzer: Setup & Execution Guide

This guide provides the technical requirements and step-by-step procedures to run the WebLog Analyzer project locally or in a production environment.

## 1. Technical Requirements

### System Prerequisites
- **Node.js**: Version 18.x or higher.
- **npm**: Version 9.x or higher.
- **Operating System**: Windows, macOS, or Linux.

### Key Dependencies
- **Frontend**: React 19, Vite 6, Tailwind CSS 4, Recharts, Socket.IO Client.
- **Backend**: Express 4, Socket.IO, JWT, BcryptJS, Multer.
- **Development Tools**: tsx (for running TypeScript directly), TypeScript 5.8.

## 2. Installation Procedure

1. **Clone/Extract the Project**:
   Ensure all files are in a dedicated directory.

2. **Install Dependencies**:
   Run the following command in the project root:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Create a `.env` file in the root directory:
   ```env
   JWT_SECRET=your_secure_random_secret_here
   PORT=3000
   ```

## 3. Running the Application

### Development Mode
To start the server with hot-reloading and Vite development middleware:
```bash
npm run dev
```
The application will be accessible at `http://localhost:3000`.

### Production Mode
1. **Build the Frontend**:
   ```bash
   npm run build
   ```
2. **Start the Server**:
   ```bash
   NODE_ENV=production npm start
   ```
   *(Note: Ensure a start script exists in package.json: `"start": "node server.ts"`)*

## 4. Troubleshooting
- **Port Conflict**: If port 3000 is in use, change the `PORT` variable in your `.env` file.
- **Module Not Found**: Run `npm install` again to ensure all peer dependencies are resolved.
- **WebSocket Connection**: Ensure no firewall is blocking WebSocket traffic on the configured port.

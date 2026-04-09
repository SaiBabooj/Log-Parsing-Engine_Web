/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import LiveLogs from './components/LiveLogs';
import UploadPage from './components/UploadPage';
import Settings from './components/Settings';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!user ? <Login /> : <Navigate to="/" replace />} 
      />
      <Route 
        path="/" 
        element={user ? <Layout><Dashboard /></Layout> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/live" 
        element={user ? <Layout><LiveLogs /></Layout> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/upload" 
        element={user ? <Layout><UploadPage /></Layout> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/settings" 
        element={user ? <Layout><Settings /></Layout> : <Navigate to="/login" replace />} 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="weblog-analyzer-theme">
      <AuthProvider>
        <Router>
          <AppContent />
          <Toaster />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}


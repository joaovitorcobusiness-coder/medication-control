import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import MedicationsPage from './pages/MedicationsPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import PrivateRoute from './components/PrivateRoute';
import { ToastProvider } from './components/Toast';
import { registerServiceWorker, registerBackgroundSync } from './utils/serviceWorkerUtils';
import notificationService from './services/notificationService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se usuário está autenticado
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setLoading(false);

    // Registrar Service Worker ao carregar
    registerServiceWorker();

    // Solicitar permissão de notificação quando autenticado
    if (token) {
      notificationService.requestPermission().then((granted) => {
        if (granted) {
          console.log('Permissão de notificação concedida');
          // Registrar sincronização em background
          registerBackgroundSync();
        }
      });
    }
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <ToastProvider>
      <>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<PrivateRoute isAuthenticated={isAuthenticated}><Dashboard /></PrivateRoute>} />
            <Route path="/perfil" element={<PrivateRoute isAuthenticated={isAuthenticated}><ProfilePage /></PrivateRoute>} />
            <Route path="/medicamentos" element={<PrivateRoute isAuthenticated={isAuthenticated}><MedicationsPage /></PrivateRoute>} />
            <Route path="/historico" element={<PrivateRoute isAuthenticated={isAuthenticated}><HistoryPage /></PrivateRoute>} />
            <Route path="/configuracoes" element={<PrivateRoute isAuthenticated={isAuthenticated}><SettingsPage /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </>
    </ToastProvider>
  );
}

export default App;

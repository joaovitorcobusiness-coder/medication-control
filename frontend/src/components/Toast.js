import React, { useState, useCallback } from 'react';
import './Toast.css';

// Context para gerenciar toasts globalmente
export const ToastContext = React.createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now();
    const toast = { id, message, type };

    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

function Toast({ id, message, type, onClose }) {
  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        {type === 'success' && <span className="toast-icon">✅</span>}
        {type === 'error' && <span className="toast-icon">❌</span>}
        {type === 'warning' && <span className="toast-icon">⚠️</span>}
        {type === 'info' && <span className="toast-icon">ℹ️</span>}
        {type === 'notification' && <span className="toast-icon">🔔</span>}
        <span className="toast-message">{message}</span>
      </div>
      <button className="toast-close" onClick={onClose}>✕</button>
    </div>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider');
  }
  return context;
}

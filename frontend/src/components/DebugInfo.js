// Debug Info Component - Mostra logs na página
import React, { useState, useEffect } from 'react';

export default function DebugInfo() {
  const [logs, setLogs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Capturar logs do console
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    const addLog = (message, type = 'log') => {
      setLogs(prev => [
        ...prev.slice(-50), // Manter últimos 50 logs
        { message: String(message), type, timestamp: new Date().toLocaleTimeString() }
      ]);
    };

    console.log = (...args) => {
      originalLog(...args);
      addLog(args.join(' '), 'log');
    };

    console.warn = (...args) => {
      originalWarn(...args);
      addLog(args.join(' '), 'warn');
    };

    console.error = (...args) => {
      originalError(...args);
      addLog(args.join(' '), 'error');
    };

    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      fontFamily: 'monospace',
      fontSize: '11px'
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '8px 12px',
          backgroundColor: '#333',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '10px'
        }}
      >
        🔧 Debug {logs.length > 0 ? `(${logs.length})` : ''}
      </button>

      {isOpen && (
        <div style={{
          backgroundColor: '#1e1e1e',
          color: '#d4d4d4',
          border: '1px solid #444',
          borderRadius: '4px',
          padding: '10px',
          maxHeight: '300px',
          width: '400px',
          overflowY: 'auto',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
        }}>
          {logs.length === 0 ? (
            <div style={{ color: '#888' }}>Nenhum log ainda...</div>
          ) : (
            logs.map((log, idx) => (
              <div
                key={idx}
                style={{
                  color: log.type === 'error' ? '#f48771' : log.type === 'warn' ? '#dcdcaa' : '#d4d4d4',
                  marginBottom: '4px',
                  paddingBottom: '4px',
                  borderBottom: '1px solid #333'
                }}
              >
                <span style={{ color: '#858585' }}>[{log.timestamp}]</span> {log.message}
              </div>
            ))
          )}
          <button
            onClick={() => setLogs([])}
            style={{
              marginTop: '8px',
              padding: '4px 8px',
              backgroundColor: '#444',
              color: '#fff',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            Limpar
          </button>
        </div>
      )}
    </div>
  );
}

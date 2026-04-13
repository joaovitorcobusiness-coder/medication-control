import React, { useState, useEffect } from 'react';
import { historyAPI } from '../services/api';
import { useToast } from '../components/Toast';
import Layout from '../components/Layout';
import './History.css';
import { FiTrash2 } from 'react-icons/fi';

export default function HistoryPage() {
  const { addToast } = useToast();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (startDate || endDate) {
      loadHistory();
    }
  }, [startDate, endDate]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await historyAPI.list(startDate, endDate);
      setHistory(response.data.history);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Tem certeza que deseja deletar todo o histórico? Esta ação não pode ser desfeita.')) {
      try {
        await historyAPI.clearAll();
        setHistory([]);
        addToast('Histórico limpo com sucesso', 'success');
      } catch (err) {
        console.error('Erro ao limpar histórico:', err);
        addToast('Erro ao limpar histórico', 'error');
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'taken': return 'status-taken';
      case 'pending': return 'status-pending';
      case 'missed': return 'status-missed';
      default: return '';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'taken': return 'Tomado';
      case 'pending': return 'Pendente';
      case 'missed': return 'Perdido';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  if (loading && history.length === 0) {
    return <Layout><div className="loading">Carregando...</div></Layout>;
  }

  return (
    <Layout>
      <div className="history-page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1>Histórico de Medicamentos</h1>
          {history.length > 0 && (
            <button 
              className="btn btn-danger"
              onClick={handleClearHistory}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FiTrash2 /> Limpar Histórico
            </button>
          )}
        </div>

        <div className="filters-card card">
          <div className="filters-row">
            <div className="form-group">
              <label htmlFor="startDate" className="label">Data de Início</label>
              <input
                id="startDate"
                type="date"
                className="input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="endDate" className="label">Data de Término</label>
              <input
                id="endDate"
                type="date"
                className="input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              style={{ alignSelf: 'flex-end' }}
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-state-icon">📋</div>
            <p>Nenhum histórico encontrado</p>
          </div>
        ) : (
          <div className="history-list">
            {history.map((item) => (
              <div key={item.id} className="history-item card">
                <div className="history-header">
                  <div className="history-info">
                    <h3>{item.medication_name}</h3>
                    <p className="history-time">
                      {new Date(item.scheduled_date).toLocaleDateString('pt-BR')} às {item.scheduled_time}
                    </p>
                  </div>
                  <div className={`status-badge ${getStatusBadgeClass(item.status)}`}>
                    {getStatusLabel(item.status)}
                  </div>
                </div>

                <div className="history-details">
                  <div className="detail">
                    <span className="detail-label">Dosagem:</span>
                    <span className="detail-value">{item.dosage} {item.unit}</span>
                  </div>

                  {item.taken_time && (
                    <div className="detail">
                      <span className="detail-label">Tomado em:</span>
                      <span className="detail-value">{item.taken_time}</span>
                    </div>
                  )}

                  {item.notes && (
                    <div className="detail">
                      <span className="detail-label">Notas:</span>
                      <span className="detail-value">{item.notes}</span>
                    </div>
                  )}

                  <div className="detail">
                    <span className="detail-label">Registrado em:</span>
                    <span className="detail-value">
                      {new Date(item.created_at).toLocaleDateString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

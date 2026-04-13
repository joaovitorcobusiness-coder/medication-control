import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, scheduleAPI, historyAPI } from '../services/api';
import notificationService from '../services/notificationService';
import { useToast } from '../components/Toast';
import Layout from '../components/Layout';
import './Dashboard.css';
import { FiClock, FiCheckCircle, FiAlertCircle, FiPlus } from 'react-icons/fi';

export default function Dashboard() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [stats, setStats] = useState({ total_today: 0, taken: 0, pending: 0 });
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Injetar callback para toasts no serviço de notificações
    notificationService.setToastCallback(addToast);
  }, [addToast]);

  useEffect(() => {
    loadData();

    // Iniciar verificação de notificações
    const fetchSchedules = async () => {
      try {
        const res = await scheduleAPI.getToday();
        return res.data;
      } catch (err) {
        console.error('Erro ao buscar agendamentos:', err);
        return null;
      }
    };

    notificationService.startMedicationReminders(fetchSchedules);

    // Limpar ao desmontar
    return () => {
      notificationService.stopMedicationReminders();
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const statsRes = await userAPI.getStats();
      const schedulesRes = await scheduleAPI.getToday();
      
      setStats(statsRes.data.stats);
      setTodaySchedules(schedulesRes.data.schedules || []);
    } catch (err) {
      setError('Erro ao carregar dados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsTaken = async (medicationId, scheduledDate, scheduledTime) => {
    try {
      await historyAPI.markTaken({
        medication_id: medicationId,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
      });
      
      // Recarregar dados
      loadData();
    } catch (err) {
      alert('Erro ao marcar medicamento como tomado');
    }
  };

  const markAsMissed = async (medicationId, scheduledDate, scheduledTime) => {
    try {
      await historyAPI.markMissed({
        medication_id: medicationId,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
      });
      
      // Recarregar dados
      loadData();
    } catch (err) {
      alert('Erro ao marcar medicamento como não tomado');
    }
  };

  if (loading) {
    return <Layout><div className="loading">Carregando...</div></Layout>;
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Olá! Bem-vindo(a)</h1>
            <p className="date-display">
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <FiAlertCircle />
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="stats-row">
          <div className="stat-card stat-card-blue">
            <div className="stat-icon">
              <FiClock />
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Hoje</div>
              <div className="stat-value">{stats.total_today}</div>
            </div>
          </div>

          <div className="stat-card stat-card-green">
            <div className="stat-icon">
              <FiCheckCircle />
            </div>
            <div className="stat-content">
              <div className="stat-label">Tomados</div>
              <div className="stat-value">{stats.taken}</div>
            </div>
          </div>

          <div className="stat-card stat-card-orange">
            <div className="stat-icon">
              <FiAlertCircle />
            </div>
            <div className="stat-content">
              <div className="stat-label">Pendentes</div>
              <div className="stat-value">{stats.pending}</div>
            </div>
          </div>
        </div>

        {/* Today's Medications */}
        <div className="section">
          <h2>Remédios de Hoje</h2>
          
          {todaySchedules.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-state-icon">💊</div>
              <p>Nenhum remédio para hoje</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/medicamentos')}
              >
                <FiPlus /> Adicionar Medicamento
              </button>
            </div>
          ) : (
            <div className="medications-list">
              {todaySchedules.map((schedule) => (
                <div key={schedule.id} className="medication-item card">
                  <div className="medication-header">
                    <div className="medication-info">
                      <h3>{schedule.medication_name}</h3>
                      <p className="medication-details">
                        {schedule.dosage} {schedule.unit} • {schedule.scheduled_time}
                      </p>
                    </div>
                    <div className={`status-badge status-${schedule.status}`}>
                      {schedule.status === 'taken' && 'Tomado'}
                      {schedule.status === 'pending' && 'Pendente'}
                      {schedule.status === 'missed' && 'Perdido'}
                    </div>
                  </div>

                  {schedule.status === 'pending' && (
                    <div className="medication-actions">
                      <button 
                        className="btn btn-success btn-small"
                        onClick={() => markAsTaken(
                          schedule.medication_id, 
                          today, 
                          schedule.scheduled_time
                        )}
                      >
                        ✓ Tomar Agora
                      </button>
                      <button 
                        className="btn btn-danger btn-small"
                        onClick={() => markAsMissed(
                          schedule.medication_id, 
                          today, 
                          schedule.scheduled_time
                        )}
                      >
                        ✗ Não Tomei
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

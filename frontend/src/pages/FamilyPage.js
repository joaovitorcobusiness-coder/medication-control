import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiPhone, FiAlertCircle } from 'react-icons/fi';
import Layout from '../components/Layout';
import { userAPI } from '../services/api';
import './Profile.css';

export default function FamilyPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await userAPI.getProfile();
        setUser(response.data.user);
      } catch (err) {
        setError('Erro ao carregar informações do familiar');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="loading">Carregando...</div>
      </Layout>
    );
  }

  const hasFamily = !!(user?.emergency_contact || user?.emergency_phone);

  return (
    <Layout>
      <div className="profile-page">
        <h1>Familiar</h1>

        {error && (
          <div className="alert alert-error">
            <FiAlertCircle /> {error}
          </div>
        )}

        <div className="profile-card card">
          {hasFamily ? (
            <div className="profile-details">
              <div className="detail-row">
                <span className="detail-label">Contato familiar:</span>
                <span className="detail-value">{user?.emergency_contact || '-'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Telefone familiar:</span>
                <span className="detail-value">{user?.emergency_phone || '-'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Como usar</span>
                <span className="detail-value">Essas informações são usadas para notificar o familiar em caso de emergência.</span>
              </div>
            </div>
          ) : (
            <div className="empty-state card">
              <div className="empty-state-icon">👥</div>
              <p>Nenhum familiar cadastrado ainda.</p>
              <button className="btn btn-primary" onClick={() => navigate('/perfil')}>
                Editar Perfil
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

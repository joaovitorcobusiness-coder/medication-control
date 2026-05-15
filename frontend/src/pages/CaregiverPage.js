import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiMail, FiUser, FiAlertCircle } from 'react-icons/fi';
import Layout from '../components/Layout';
import { userAPI } from '../services/api';
import './Profile.css';

export default function CaregiverPage() {
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
        setError('Erro ao carregar informações do cuidador');
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

  const hasCaregiver = !!user?.caregiver_email;

  return (
    <Layout>
      <div className="profile-page">
        <h1>Cuidador</h1>

        {error && (
          <div className="alert alert-error">
            <FiAlertCircle /> {error}
          </div>
        )}

        <div className="profile-card card">
          {hasCaregiver ? (
            <div className="profile-details">
              <div className="detail-row">
                <span className="detail-label">Responsável pelo cuidado:</span>
                <span className="detail-value">{user?.caregiver_email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Como usar</span>
                <span className="detail-value">Este email será usado para avisar o cuidador sobre o plano de medicamentos.</span>
              </div>
            </div>
          ) : (
            <div className="empty-state card">
              <div className="empty-state-icon">❤️</div>
              <p>Nenhum cuidador cadastrado ainda.</p>
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

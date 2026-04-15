import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useToast } from '../components/Toast';
import Layout from '../components/Layout';
import './Admin.css';
import { FiUsers, FiMail, FiPhone, FiCalendar } from 'react-icons/fi';

export default function AdminPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.listUsers();
      setUsers(response.data.users);
    } catch (err) {
      setError('Erro ao carregar usuários');
      addToast('Erro ao carregar usuários', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><div className="loading">Carregando...</div></Layout>;

  return (
    <Layout>
      <div className="admin-page">
        <h1>Administração - Contas Registradas</h1>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div className="stats-card card">
          <div className="stat-item">
            <FiUsers className="stat-icon" />
            <div>
              <h3>{users.length}</h3>
              <p>Total de Usuários</p>
            </div>
          </div>
        </div>

        <div className="users-section card">
          <h2>Usuários Registrados</h2>

          {users.length === 0 ? (
            <p className="empty-message">Nenhum usuário registrado</p>
          ) : (
            <div className="users-table">
              <div className="table-header">
                <span>Nome</span>
                <span>Email</span>
                <span>Telefone</span>
                <span>CPF</span>
                <span>Data de Registro</span>
              </div>

              {users.map(user => (
                <div key={user.id} className="table-row">
                  <div className="user-name">
                    <FiUsers className="user-icon" />
                    {user.name}
                  </div>
                  <div className="user-email">
                    <FiMail className="user-icon" />
                    {user.email}
                  </div>
                  <div className="user-phone">
                    <FiPhone className="user-icon" />
                    {user.phone || 'Não informado'}
                  </div>
                  <div className="user-cpf">
                    {user.cpf || 'Não informado'}
                  </div>
                  <div className="user-date">
                    <FiCalendar className="user-icon" />
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
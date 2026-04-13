import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import Layout from '../components/Layout';
import './Profile.css';
import { FiEdit2, FiSave } from 'react-icons/fi';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setUser(response.data.user);
      setFormData(response.data.user);
      setLoading(false);
    } catch (err) {
      setMessage('Erro ao carregar perfil');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userAPI.updateProfile(formData);
      setUser(formData);
      setEditing(false);
      setMessage('Perfil atualizado com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Erro ao atualizar perfil');
    }
  };

  if (loading) return <Layout><div className="loading">Carregando...</div></Layout>;

  return (
    <Layout>
      <div className="profile-page">
        <h1>Meu Perfil</h1>

        {message && (
          <div className={`alert ${message.includes('sucesso') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        <div className="profile-card card">
          <div className="profile-header">
            <div className="profile-avatar">
              <span>👤</span>
            </div>
            <div className="profile-info">
              <h2>{user?.name}</h2>
              <p>{user?.email}</p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => setEditing(!editing)}
            >
              <FiEdit2 /> {editing ? 'Cancelar' : 'Editar'}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name" className="label">Nome</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    className="input"
                    value={formData.name || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email" className="label">Email</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    className="input"
                    value={formData.email || ''}
                    onChange={handleChange}
                    disabled
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone" className="label">Telefone</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    className="input"
                    value={formData.phone || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cpf" className="label">CPF</label>
                  <input
                    id="cpf"
                    type="text"
                    name="cpf"
                    className="input"
                    value={formData.cpf || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="address" className="label">Endereço</label>
                  <input
                    id="address"
                    type="text"
                    name="address"
                    className="input"
                    value={formData.address || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city" className="label">Cidade</label>
                  <input
                    id="city"
                    type="text"
                    name="city"
                    className="input"
                    value={formData.city || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="state" className="label">Estado</label>
                  <input
                    id="state"
                    type="text"
                    name="state"
                    className="input"
                    maxLength="2"
                    value={formData.state || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="emergency_contact" className="label">Contato de Emergência</label>
                  <input
                    id="emergency_contact"
                    type="text"
                    name="emergency_contact"
                    className="input"
                    value={formData.emergency_contact || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="emergency_phone" className="label">Telefone de Emergência</label>
                  <input
                    id="emergency_phone"
                    type="tel"
                    name="emergency_phone"
                    className="input"
                    value={formData.emergency_phone || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-success">
                <FiSave /> Salvar Alterações
              </button>
            </form>
          ) : (
            <div className="profile-details">
              <div className="detail-row">
                <span className="detail-label">Telefone:</span>
                <span className="detail-value">{user?.phone || '-'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">CPF:</span>
                <span className="detail-value">{user?.cpf || '-'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Endereço:</span>
                <span className="detail-value">{user?.address || '-'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Cidade:</span>
                <span className="detail-value">{user?.city || '-'}, {user?.state || '-'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Contato de Emergência:</span>
                <span className="detail-value">{user?.emergency_contact || '-'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Telefone de Emergência:</span>
                <span className="detail-value">{user?.emergency_phone || '-'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Auth.css';
import { FiUser, FiMail, FiLock, FiCalendar, FiPhone, FiAlertCircle } from 'react-icons/fi';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    date_of_birth: '',
    phone: '',
    cpf: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.register(formData);
      
      if (response.data.success) {
        alert('Cadastro realizado com sucesso! Faça login para continuar.');
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🔗 Meus Remédios</h1>
          <p>Criar nova conta</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <FiAlertCircle />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="name" className="label">
              <FiUser /> Nome Completo
            </label>
            <input
              id="name"
              type="text"
              name="name"
              className="input"
              placeholder="Seu nome"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label htmlFor="email" className="label">
              <FiMail /> Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              className="input"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password" className="label">
              <FiLock /> Senha
            </label>
            <input
              id="password"
              type="password"
              name="password"
              className="input"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label htmlFor="date_of_birth" className="label">
              <FiCalendar /> Data de Nascimento
            </label>
            <input
              id="date_of_birth"
              type="date"
              name="date_of_birth"
              className="input"
              value={formData.date_of_birth}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label htmlFor="phone" className="label">
              <FiPhone /> Telefone
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              className="input"
              placeholder="(11) 98765-4321"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label htmlFor="cpf" className="label">
              📝 CPF
            </label>
            <input
              id="cpf"
              type="text"
              name="cpf"
              className="input"
              placeholder="000.000.000-00"
              value={formData.cpf}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Criando conta...' : 'Cadastrar'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Já tem uma conta? <Link to="/login">Faça login aqui</Link></p>
        </div>
      </div>
    </div>
  );
}

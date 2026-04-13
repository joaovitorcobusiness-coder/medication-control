import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Auth.css';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';

export default function LoginPage({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setIsAuthenticated(true);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🔗 Meus Remédios</h1>
          <p>Controle de medicamentos para idosos</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <FiAlertCircle />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email" className="label">
              <FiMail /> Email
            </label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              className="input"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Não tem uma conta? <Link to="/register">Cadastre-se aqui</Link></p>
        </div>
      </div>
    </div>
  );
}

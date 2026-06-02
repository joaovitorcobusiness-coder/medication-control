import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Auth.css';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';

const TEST_ACCOUNTS = [
  { label: 'Funcionário', email: 'funcionario@teste.com', password: 'Funcionario@123' },
  { label: 'Paciente', email: 'paciente@teste.com', password: 'Paciente@123' },
  { label: 'Cuidador', email: 'cuidador@teste.com', password: 'Cuidador@123' },
  { label: 'Familiar', email: 'familiar@teste.com', password: 'Familiar@123' },
];

const getRoleFromEmail = (email) => {
  const normalizedEmail = String(email || '').toLowerCase();

  if (normalizedEmail.includes('funcionario') || normalizedEmail.includes('admin')) return 'funcionario';
  if (normalizedEmail.includes('paciente')) return 'patient';
  if (normalizedEmail.includes('cuidador')) return 'caregiver';
  if (normalizedEmail.includes('familiar')) return 'family';

  return 'user';
};

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
        const user = {
          ...response.data.user,
          role: response.data.user.role || getRoleFromEmail(response.data.user.email),
        };

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(user));
        setIsAuthenticated(true);

        if (user.role === 'funcionario') {
          navigate('/admin');
        } else if (user.role === 'patient') {
          navigate('/');
        } else if (user.role === 'caregiver') {
          navigate('/cuidador');
        } else if (user.role === 'family') {
          navigate('/familiar');
        } else {
          navigate('/');
        }
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

        <div className="auth-footer" style={{ marginTop: '1rem' }}>
          <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Credenciais de teste</p>
          {TEST_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', marginBottom: '0.5rem' }}
              onClick={() => {
                setEmail(account.email);
                setPassword(account.password);
              }}
            >
              Usar {account.label}: {account.email}
            </button>
          ))}
          <p style={{ marginTop: '0.75rem' }}>Não tem uma conta? <Link to="/register">Cadastre-se aqui</Link></p>
        </div>
      </div>
    </div>
  );
}

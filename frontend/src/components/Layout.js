import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiPackage, FiClock, FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import './Layout.css';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <a href="/" className="header-logo">
            <span>🔗</span>
            <span>Meus Remédios</span>
          </a>

          <nav className="header-nav">
            <a 
              href="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); navigate('/'); }}
            >
              <FiHome /> Início
            </a>
            <a 
              href="/medicamentos" 
              className={`nav-link ${isActive('/medicamentos') ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); navigate('/medicamentos'); }}
            >
              <FiPackage /> Medicamentos
            </a>
            <a 
              href="/historico" 
              className={`nav-link ${isActive('/historico') ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); navigate('/historico'); }}
            >
              <FiClock /> Histórico
            </a>
            <a 
              href="/perfil" 
              className={`nav-link ${isActive('/perfil') ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); navigate('/perfil'); }}
            >
              <FiUser /> Perfil
            </a>
            <a 
              href="/configuracoes" 
              className={`nav-link ${isActive('/configuracoes') ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); navigate('/configuracoes'); }}
            >
              <FiSettings /> Configurações
            </a>
            <button 
              className="nav-link"
              onClick={handleLogout}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <FiLogOut /> Sair
            </button>
          </nav>
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>

      <nav className="bottom-nav">
        <a 
          href="/" 
          className={`bottom-nav-item ${isActive('/') ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); navigate('/'); }}
        >
          <FiHome />
          <span>Início</span>
        </a>
        <a 
          href="/medicamentos" 
          className={`bottom-nav-item ${isActive('/medicamentos') ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); navigate('/medicamentos'); }}
        >
          <FiPackage />
          <span>Remédios</span>
        </a>
        <a 
          href="/historico" 
          className={`bottom-nav-item ${isActive('/historico') ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); navigate('/historico'); }}
        >
          <FiClock />
          <span>Histórico</span>
        </a>
        <a 
          href="/perfil" 
          className={`bottom-nav-item ${isActive('/perfil') ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); navigate('/perfil'); }}
        >
          <FiUser />
          <span>Perfil</span>
        </a>
      </nav>
    </div>
  );
}

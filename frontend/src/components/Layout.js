import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiPackage, FiClock, FiUser, FiSettings, FiLogOut, FiHeart, FiUsers } from 'react-icons/fi';
import './Layout.css';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : {};
  });

  useEffect(() => {
    const updateUser = () => {
      const stored = localStorage.getItem('user');
      setUser(stored ? JSON.parse(stored) : {});
    };

    window.addEventListener('profileUpdate', updateUser);
    return () => window.removeEventListener('profileUpdate', updateUser);
  }, []);

  const hasCaregiver = !!user?.caregiver_email;
  const hasFamily = !!(user?.emergency_contact || user?.emergency_phone);

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
            {hasCaregiver && (
              <a 
                href="/cuidador" 
                className={`nav-link ${isActive('/cuidador') ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); navigate('/cuidador'); }}
              >
                <FiHeart /> Cuidador
              </a>
            )}
            {hasFamily && (
              <a 
                href="/familiar" 
                className={`nav-link ${isActive('/familiar') ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); navigate('/familiar'); }}
              >
                <FiUsers /> Familiar
              </a>
            )}
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
        {hasCaregiver && (
          <a 
            href="/cuidador" 
            className={`bottom-nav-item ${isActive('/cuidador') ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); navigate('/cuidador'); }}
          >
            <FiHeart />
            <span>Cuidador</span>
          </a>
        )}
        {hasFamily && (
          <a 
            href="/familiar" 
            className={`bottom-nav-item ${isActive('/familiar') ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); navigate('/familiar'); }}
          >
            <FiUsers />
            <span>Familiar</span>
          </a>
        )}
      </nav>
    </div>
  );
}

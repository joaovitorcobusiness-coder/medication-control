import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { iotAPI } from '../services/api';
import { getOrCreateDeviceId, getDeviceInfo } from '../utils/deviceUtils';
import { useToast } from '../components/Toast';
import Layout from '../components/Layout';
import './Settings.css';
import { FiLogOut, FiSmartphone, FiTrash2, FiCopy, FiCheck } from 'react-icons/fi';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [deviceForm, setDeviceForm] = useState({
    device_id: '',
    device_name: '',
    device_type: 'web',
    platform: 'web',
  });
  const [showDeviceForm, setShowDeviceForm] = useState(false);

  useEffect(() => {
    // Gerar/obter device_id ao carregar a página
    const info = getDeviceInfo();
    setDeviceInfo(info);
    setDeviceForm(prev => ({
      ...prev,
      device_id: info.device_id,
      device_name: info.device_name,
      platform: info.platform,
    }));
    
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const response = await iotAPI.listDevices();
      setDevices(response.data.devices);
    } catch (err) {
      setMessage('Erro ao carregar dispositivos');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(true);
      addToast('Device ID copiado para a área de transferência!', 'success');
      setTimeout(() => setCopiedId(false), 2000);
    } catch (err) {
      addToast('Erro ao copiar', 'error');
    }
  };

  const handleDeviceFormChange = (e) => {
    const { name, value } = e.target;
    setDeviceForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegisterDevice = async (e) => {
    e.preventDefault();
    
    try {
      await iotAPI.registerDevice({
        ...deviceForm,
        token: 'web-notification-' + Date.now(),
      });
      
      addToast('Dispositivo registrado com sucesso!', 'success');
      
      // Recarregar informações do dispositivo
      const info = getDeviceInfo();
      setDeviceInfo(info);
      setDeviceForm({
        device_id: info.device_id,
        device_name: info.device_name,
        device_type: 'web',
        platform: info.platform,
      });
      
      setShowDeviceForm(false);
      loadDevices();
    } catch (err) {
      addToast('Erro ao registrar dispositivo', 'error');
    }
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    if (window.confirm('Tem certeza que deseja remover este dispositivo?')) {
      try {
        await iotAPI.deleteDevice(deviceId);
        showToast('Dispositivo removido com sucesso', 'success');
        loadDevices();
      } catch (error) {
        console.error('Erro ao deletar dispositivo:', error);
        showToast('Erro ao remover dispositivo', 'error');
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  if (loading) return <Layout><div className="loading">Carregando...</div></Layout>;

  return (
    <Layout>
      <div className="settings-page">
        <h1>Configurações</h1>

        {message && (
          <div className={`alert ${message.includes('sucesso') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        {/* IoT Devices Section */}
        <div className="settings-section card">
          <div className="section-header">
            <h2>Dispositivos IoT</h2>
            <button 
              className="btn btn-primary btn-small"
              onClick={() => setShowDeviceForm(!showDeviceForm)}
            >
              <FiSmartphone /> {showDeviceForm ? 'Cancelar' : 'Adicionar Dispositivo'}
            </button>
          </div>

          {/* Device ID Info */}
          {deviceInfo && (
            <div style={{ padding: '16px', backgroundColor: '#f0f7ff', borderRadius: '8px', marginBottom: '20px', border: '1px solid #b3d9ff' }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px', color: '#0066cc' }}>📱 Seu Device ID</h3>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                Este é o identificador único do seu dispositivo. Use este ID para registrar este computador.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <code style={{ 
                  flex: 1, 
                  padding: '10px', 
                  backgroundColor: 'white', 
                  borderRadius: '4px', 
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  wordBreak: 'break-all',
                  border: '1px solid #ddd'
                }}>
                  {deviceInfo.device_id}
                </code>
                <button
                  onClick={() => copyToClipboard(deviceInfo.device_id)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: copiedId ? '#10b981' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    transition: 'background-color 0.2s'
                  }}
                >
                  {copiedId ? <FiCheck /> : <FiCopy />}
                  {copiedId ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
              <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>
                📋 {deviceInfo.device_name}
              </p>
            </div>
          )}

          {showDeviceForm && (
            <form onSubmit={handleRegisterDevice} className="device-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="device_id" className="label">ID do Dispositivo *</label>
                  <input
                    id="device_id"
                    type="text"
                    name="device_id"
                    className="input"
                    placeholder="Device ID único"
                    value={deviceForm.device_id}
                    onChange={handleDeviceFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="device_name" className="label">Nome do Dispositivo *</label>
                  <input
                    id="device_name"
                    type="text"
                    name="device_name"
                    className="input"
                    placeholder="Ex: Meu Smartphone"
                    value={deviceForm.device_name}
                    onChange={handleDeviceFormChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="device_type" className="label">Tipo de Dispositivo</label>
                  <select
                    id="device_type"
                    name="device_type"
                    className="input"
                    value={deviceForm.device_type}
                    onChange={handleDeviceFormChange}
                  >
                    <option value="web">Computador/Web</option>
                    <option value="mobile">Celular</option>
                    <option value="smartwatch">Smartwatch</option>
                    <option value="speaker">Alto-falante Inteligente</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="platform" className="label">Plataforma</label>
                  <select
                    id="platform"
                    name="platform"
                    className="input"
                    value={deviceForm.platform}
                    onChange={handleDeviceFormChange}
                  >
                    <option value="web">Web</option>
                    <option value="ios">iOS</option>
                    <option value="android">Android</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-success">
                Registrar Dispositivo
              </button>
            </form>
          )}

          <div className="devices-list">
            {devices.length === 0 ? (
              <p className="empty-message">Nenhum dispositivo registrado</p>
            ) : (
              devices.map(device => (
                <div key={device.device_id} className="device-item">
                  <div className="device-info">
                    <h3>{device.device_name}</h3>
                    <div className="device-details">
                      <span className="device-type">Tipo: {device.device_type}</span>
                      <span className="device-platform">Plataforma: {device.platform}</span>
                      <span className={`device-status ${device.is_active ? 'active' : 'inactive'}`}>
                        {device.is_active ? '✓ Ativo' : '✗ Inativo'}
                      </span>
                      {device.last_connected && (
                        <span className="device-connected">
                          Último acesso: {new Date(device.last_connected).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    className="btn btn-danger btn-small"
                    onClick={() => handleDeleteDevice(device.device_id)}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notifications Settings */}
        <div className="settings-section card">
          <h2>Notificações</h2>
          <div className="setting-item">
            <label className="checkbox-label">
              <input type="checkbox" defaultChecked />
              <span>Receber lembretes de medicamentos</span>
            </label>
          </div>
          <div className="setting-item">
            <label className="checkbox-label">
              <input type="checkbox" defaultChecked />
              <span>Notificações de medicamentos perdidos</span>
            </label>
          </div>
          <div className="setting-item">
            <label className="checkbox-label">
              <input type="checkbox" defaultChecked />
              <span>Notificações de alterações no perfil</span>
            </label>
          </div>
        </div>

        {/* Account Settings */}
        <div className="settings-section card">
          <h2>Conta</h2>
          <button 
            className="btn btn-danger"
            onClick={handleLogout}
          >
            <FiLogOut /> Sair da Conta
          </button>
        </div>

        {/* About */}
        <div className="settings-section card">
          <h2>Sobre</h2>
          <div className="about-info">
            <p><strong>Meus Remédios</strong></p>
            <p>Versão: 1.0.0</p>
            <p>© 2026 - Todos os direitos reservados</p>
            <p style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              Este aplicativo foi desenvolvido para ajudar idosos a controlar 
              e gerenciar seus medicamentos de forma segura e eficiente.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

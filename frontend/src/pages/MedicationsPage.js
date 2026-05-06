import React, { useState, useEffect } from 'react';
import { medicationAPI, scheduleAPI } from '../services/api';
import Layout from '../components/Layout';
import './Medications.css';
import { FiPlus, FiX, FiEdit2 } from 'react-icons/fi';

export default function MedicationsPage() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dosage: '',
    unit: 'mg',
    frequency: '',
    start_date: '',
    end_date: '',
    notes: '',
    start_time: '08:00',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      const response = await medicationAPI.list();
      setMedications(response.data.medications);
    } catch (err) {
      setMessage('Erro ao carregar medicamentos');
    } finally {
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
      let medicationId;
      
      if (editingId) {
        await medicationAPI.update(editingId, formData);
        medicationId = editingId;
        setMessage('Medicamento atualizado com sucesso!');
      } else {
        const response = await medicationAPI.create(formData);
        medicationId = response.data.medication_id;
        setMessage('Medicamento adicionado com sucesso!');
        
        // Calcular horários baseado na frequência
        const times = calculateScheduleTimes(formData.frequency, formData.start_time);
        
        // Gerar agendamentos automaticamente para novo medicamento
        if (formData.start_date && formData.end_date && times.length > 0) {
          try {
            const start = new Date(formData.start_date);
            const end = new Date(formData.end_date);
            const currentDate = new Date(start);

            while (currentDate <= end) {
              for (const time of times) {
                await scheduleAPI.create({
                  medication_id: medicationId,
                  scheduled_time: time,
                  day_of_week: 'Todos os dias',
                });
              }
              currentDate.setDate(currentDate.getDate() + 1);
            }
          } catch (err) {
            console.error('Erro ao gerar agendamentos:', err);
          }
        }
      }
      
      loadMedications();
      resetForm();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Erro ao salvar medicamento');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este medicamento?')) {
      try {
        await medicationAPI.delete(id);
        loadMedications();
        setMessage('Medicamento deletado com sucesso!');
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        setMessage('Erro ao deletar medicamento');
      }
    }
  };

  const handleEdit = (medication) => {
    setFormData(medication);
    setEditingId(medication.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      dosage: '',
      unit: 'mg',
      frequency: '',
      start_date: '',
      end_date: '',
      notes: '',
      start_time: '08:00',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const calculateScheduleTimes = (frequency, startTime) => {
    const times = [];
    const [hours, minutes] = startTime.split(':').map(Number);
    let currentHour = hours;

    const addTime = (h) => {
      const time = `${String(h).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      if (!times.includes(time)) times.push(time);
    };

    switch (frequency) {
      case 'Uma vez ao dia':
        times.push(startTime);
        break;
      case 'Duas vezes ao dia':
        addTime(currentHour);
        addTime((currentHour + 12) % 24);
        break;
      case 'Três vezes ao dia':
        addTime(currentHour);
        addTime((currentHour + 8) % 24);
        addTime((currentHour + 16) % 24);
        break;
      case 'A cada 2 horas':
        for (let i = 0; i < 24; i += 2) {
          addTime((currentHour + i) % 24);
        }
        break;
      case 'A cada 3 horas':
        for (let i = 0; i < 24; i += 3) {
          addTime((currentHour + i) % 24);
        }
        break;
      case 'A cada 6 horas':
        addTime(currentHour);
        addTime((currentHour + 6) % 24);
        addTime((currentHour + 12) % 24);
        addTime((currentHour + 18) % 24);
        break;
      default:
        times.push(startTime);
    }

    return times.sort();
  };

  if (loading) return <Layout><div className="loading">Carregando...</div></Layout>;

  return (
    <Layout>
      <div className="medications-page">
        <div className="page-header">
          <h1>Meus Medicamentos</h1>
          <div className="button-group">
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              <FiPlus /> {showForm ? 'Cancelar' : 'Adicionar Medicamento'}
            </button>
          </div>
        </div>

        {message && (
          <div className={`alert ${message.includes('sucesso') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        {showForm && (
          <div className="form-card card">
            <h2>{editingId ? 'Editar' : 'Novo'} Medicamento</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name" className="label">Nome do Medicamento *</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    className="input"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="dosage" className="label">Dosagem *</label>
                  <input
                    id="dosage"
                    type="text"
                    name="dosage"
                    className="input"
                    placeholder="Ex: 500"
                    value={formData.dosage}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="unit" className="label">Unidade *</label>
                  <select
                    id="unit"
                    name="unit"
                    className="input"
                    value={formData.unit}
                    onChange={handleChange}
                    required
                  >
                    <option value="mg">mg (miligramas)</option>
                    <option value="g">g (gramas)</option>
                    <option value="ml">ml (mililitros)</option>
                    <option value="unidade">Unidade</option>
                    <option value="comprimido">Comprimido</option>
                    <option value="gota">Gota</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="frequency" className="label">Frequência *</label>
                  <select
                    id="frequency"
                    name="frequency"
                    className="input"
                    value={formData.frequency}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione a frequência</option>
                    <option value="Uma vez ao dia">Uma vez ao dia</option>
                    <option value="Duas vezes ao dia">Duas vezes ao dia</option>
                    <option value="Três vezes ao dia">Três vezes ao dia</option>
                    <option value="A cada 2 horas">A cada 2 horas</option>
                    <option value="A cada 3 horas">A cada 3 horas</option>
                    <option value="A cada 6 horas">A cada 6 horas</option>
                    <option value="Outro">Outro (especificar nas notas)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="start_time" className="label">Horário de Início *</label>
                  <input
                    id="start_time"
                    type="time"
                    name="start_time"
                    className="input"
                    value={formData.start_time}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="start_date" className="label">Data de Início</label>
                  <input
                    id="start_date"
                    type="date"
                    name="start_date"
                    className="input"
                    value={formData.start_date}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="end_date" className="label">Data de Término</label>
                  <input
                    id="end_date"
                    type="date"
                    name="end_date"
                    className="input"
                    value={formData.end_date}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description" className="label">Descrição</label>
                <textarea
                  id="description"
                  name="description"
                  className="input"
                  rows="2"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes" className="label">Notas{formData.frequency === 'Outro' ? ' *' : ''}</label>
                <textarea
                  id="notes"
                  name="notes"
                  className="input"
                  rows="2"
                  placeholder={formData.frequency === 'Outro' ? 'Especifique a frequência personalizada' : 'Ex: Tomar com comida, não tomar com leite'}
                  value={formData.notes}
                  onChange={handleChange}
                  required={formData.frequency === 'Outro'}
                />
                {formData.frequency === 'Outro' && (
                  <small className="form-hint">Por favor, especifique a frequência nas notas.</small>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-success">
                  Salvar Medicamento
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={resetForm}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="medications-grid">
          {medications.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-state-icon">💊</div>
              <p>Nenhum medicamento cadastrado</p>
              <p>Clique em "Adicionar Medicamento" para começar</p>
            </div>
          ) : (
            medications.map(med => (
              <div key={med.id} className="medication-card card">
                <div className="medication-header">
                  <div>
                    <h3>{med.name}</h3>
                    <p className="dosage-info">{med.dosage} {med.unit}</p>
                  </div>
                  <div className="medication-actions">
                    <button 
                      className="btn-icon"
                      onClick={() => handleEdit(med)}
                      title="Editar"
                    >
                      <FiEdit2 />
                    </button>
                    <button 
                      className="btn-icon btn-danger"
                      onClick={() => handleDelete(med.id)}
                      title="Deletar"
                    >
                      <FiX />
                    </button>
                  </div>
                </div>

                <div className="medication-body">
                  {med.description && (
                    <div className="detail">
                      <span className="detail-label">Descrição:</span>
                      <span className="detail-value">{med.description}</span>
                    </div>
                  )}
                  
                  <div className="detail">
                    <span className="detail-label">Frequência:</span>
                    <span className="detail-value">{med.frequency}</span>
                  </div>

                  {med.notes && (
                    <div className="detail">
                      <span className="detail-label">Notas:</span>
                      <span className="detail-value">{med.notes}</span>
                    </div>
                  )}

                  <div className="detail">
                    <span className="detail-label">Agendamentos:</span>
                    <span className="detail-value">{med.schedule_count || 0}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}

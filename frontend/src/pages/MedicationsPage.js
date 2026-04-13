import React, { useState, useEffect } from 'react';
import { medicationAPI, scheduleAPI } from '../services/api';
import Layout from '../components/Layout';
import './Medications.css';
import { FiPlus, FiX, FiEdit2 } from 'react-icons/fi';

export default function MedicationsPage() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedMedicationId, setSelectedMedicationId] = useState(null);
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
  });
  const [scheduleData, setScheduleData] = useState({
    scheduled_time: '',
    day_of_week: 'Monday',
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
      if (editingId) {
        await medicationAPI.update(editingId, formData);
        setMessage('Medicamento atualizado com sucesso!');
      } else {
        await medicationAPI.create(formData);
        setMessage('Medicamento adicionado com sucesso!');
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
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleScheduleChange = (e) => {
    const { name, value } = e.target;
    setScheduleData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    
    try {
      if (!selectedMedicationId) {
        setMessage('Selecione um medicamento');
        return;
      }

      if (!scheduleData.scheduled_time) {
        setMessage('Especifique o horário');
        return;
      }

      await scheduleAPI.create({
        medication_id: selectedMedicationId,
        scheduled_time: scheduleData.scheduled_time,
        day_of_week: scheduleData.day_of_week,
      });

      setMessage('Horário adicionado com sucesso!');
      setScheduleData({ scheduled_time: '', day_of_week: 'Monday' });
      setSelectedMedicationId(null);
      setShowScheduleForm(false);
      loadMedications();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Erro ao adicionar horário');
    }
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
            <button 
              className="btn btn-secondary"
              onClick={() => setShowScheduleForm(!showScheduleForm)}
            >
              <FiPlus /> {showScheduleForm ? 'Cancelar' : 'Agendar Horário'}
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
                  <input
                    id="frequency"
                    type="text"
                    name="frequency"
                    className="input"
                    placeholder="Ex: 2x ao dia"
                    value={formData.frequency}
                    onChange={handleChange}
                    required
                  />
                </div>
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
                <label htmlFor="notes" className="label">Notas</label>
                <textarea
                  id="notes"
                  name="notes"
                  className="input"
                  rows="2"
                  placeholder="Ex: Tomar com comida, não tomar com leite"
                  value={formData.notes}
                  onChange={handleChange}
                />
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

        {showScheduleForm && (
          <div className="form-card card">
            <h2>Agendar Horário do Medicamento</h2>
            <form onSubmit={handleAddSchedule}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="medication_select" className="label">Medicamento *</label>
                  <select
                    id="medication_select"
                    className="input"
                    value={selectedMedicationId || ''}
                    onChange={(e) => setSelectedMedicationId(parseInt(e.target.value))}
                    required
                  >
                    <option value="">Selecione um medicamento</option>
                    {medications.map(med => (
                      <option key={med.id} value={med.id}>
                        {med.name} - {med.dosage} {med.unit}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="scheduled_time" className="label">Horário *</label>
                  <input
                    id="scheduled_time"
                    type="time"
                    name="scheduled_time"
                    className="input"
                    value={scheduleData.scheduled_time}
                    onChange={handleScheduleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="day_of_week" className="label">Dia da Semana *</label>
                  <select
                    id="day_of_week"
                    name="day_of_week"
                    className="input"
                    value={scheduleData.day_of_week}
                    onChange={handleScheduleChange}
                    required
                  >
                    <option value="Monday">Segunda-feira</option>
                    <option value="Tuesday">Terça-feira</option>
                    <option value="Wednesday">Quarta-feira</option>
                    <option value="Thursday">Quinta-feira</option>
                    <option value="Friday">Sexta-feira</option>
                    <option value="Saturday">Sábado</option>
                    <option value="Sunday">Domingo</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-success">
                  Agendar Horário
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => {
                    setShowScheduleForm(false);
                    setSelectedMedicationId(null);
                    setScheduleData({ scheduled_time: '', day_of_week: 'Monday' });
                  }}
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

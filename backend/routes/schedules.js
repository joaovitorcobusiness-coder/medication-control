const express = require('express');
const authMiddleware = require('../middleware/auth');
const { query } = require('../utils/database');

const router = express.Router();

// Listar agendamentos do usuário
router.get('/', authMiddleware, async (req, res) => {
  try {
    const schedules = await query(
      `SELECT ms.*, m.name as medication_name, m.dosage, m.unit
       FROM medication_schedules ms
       JOIN medications m ON ms.medication_id = m.id
       WHERE ms.user_id = ?
       ORDER BY ms.scheduled_time ASC`,
      [req.userId]
    );

    res.json({
      success: true,
      schedules,
    });
  } catch (error) {
    console.error('Error listing schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar agendamentos',
    });
  }
});

// Obter agendamentos de hoje
router.get('/today', authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayIndex = new Date().getDay();
    const currentDayName = dayOfWeek[currentDayIndex];

    const todaySchedules = await query(
      `SELECT ms.*, m.name as medication_name, m.dosage, m.unit,
              COALESCE(mh.status, 'pending') as status,
              mh.taken_time, mh.id as history_id
       FROM medication_schedules ms
       JOIN medications m ON ms.medication_id = m.id
       LEFT JOIN medication_history mh ON ms.medication_id = mh.medication_id 
         AND mh.scheduled_date = ?
         AND mh.scheduled_time = ms.scheduled_time
       WHERE ms.user_id = ? AND (ms.day_of_week LIKE ? OR ms.day_of_week IS NULL)
       ORDER BY ms.scheduled_time ASC`,
      [today, req.userId, `%${currentDayName}%`]
    );

    res.json({
      success: true,
      schedules: todaySchedules,
      date: today,
    });
  } catch (error) {
    console.error('Error getting today schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter agendamentos de hoje',
    });
  }
});

// Criar agendamento
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { medication_id, scheduled_time, day_of_week, reminder_enabled } = req.body;

    // Verificar se medicamento pertence ao usuário
    const meds = await query(
      'SELECT id FROM medications WHERE id = ? AND user_id = ?',
      [medication_id, req.userId]
    );

    if (meds.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Medicamento não pertence ao usuário',
      });
    }

    const result = await query(
      `INSERT INTO medication_schedules (medication_id, user_id, scheduled_time, day_of_week, reminder_enabled)
       VALUES (?, ?, ?, ?, ?)`,
      [medication_id, req.userId, scheduled_time, day_of_week, reminder_enabled !== false]
    );

    res.status(201).json({
      success: true,
      schedule_id: result.insertId,
      message: 'Agendamento criado com sucesso',
    });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar agendamento',
    });
  }
});

// Atualizar agendamento
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { scheduled_time, day_of_week, reminder_enabled } = req.body;

    await query(
      `UPDATE medication_schedules SET 
        scheduled_time = ?, day_of_week = ?, reminder_enabled = ?
       WHERE id = ? AND user_id = ?`,
      [scheduled_time, day_of_week, reminder_enabled !== false, req.params.id, req.userId]
    );

    res.json({
      success: true,
      message: 'Agendamento atualizado com sucesso',
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar agendamento',
    });
  }
});

// Deletar agendamento
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await query(
      'DELETE FROM medication_schedules WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );

    res.json({
      success: true,
      message: 'Agendamento deletado com sucesso',
    });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar agendamento',
    });
  }
});

module.exports = router;

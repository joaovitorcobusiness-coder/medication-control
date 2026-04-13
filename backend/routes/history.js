const express = require('express');
const authMiddleware = require('../middleware/auth');
const { query } = require('../utils/database');

const router = express.Router();

// Obter histórico de medicamentos
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let sql = `SELECT mh.*, m.name as medication_name, m.dosage, m.unit
               FROM medication_history mh
               JOIN medications m ON mh.medication_id = m.id
               WHERE mh.user_id = ?`;
    
    const params = [req.userId];

    if (start_date) {
      sql += ' AND mh.scheduled_date >= ?';
      params.push(start_date);
    }

    if (end_date) {
      sql += ' AND mh.scheduled_date <= ?';
      params.push(end_date);
    }

    sql += ' ORDER BY mh.scheduled_date DESC, mh.scheduled_time DESC';

    const history = await query(sql, params);

    res.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter histórico',
    });
  }
});

// Marcar medicamento como tomado
router.post('/mark-taken', authMiddleware, async (req, res) => {
  try {
    const { medication_id, scheduled_date, scheduled_time } = req.body;

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

    const takenTime = new Date().toTimeString().slice(0, 8);

    // Verificar se já existe registro
    const existing = await query(
      `SELECT id FROM medication_history 
       WHERE medication_id = ? AND user_id = ? AND scheduled_date = ? AND scheduled_time = ?`,
      [medication_id, req.userId, scheduled_date, scheduled_time]
    );

    if (existing.length > 0) {
      // Atualizar registro existente
      await query(
        `UPDATE medication_history SET status = 'taken', taken_time = ? 
         WHERE id = ?`,
        [takenTime, existing[0].id]
      );
    } else {
      // Criar novo registro
      await query(
        `INSERT INTO medication_history (medication_id, user_id, scheduled_date, scheduled_time, taken_time, status)
         VALUES (?, ?, ?, ?, ?, 'taken')`,
        [medication_id, req.userId, scheduled_date, scheduled_time, takenTime]
      );
    }

    res.json({
      success: true,
      message: 'Medicamento marcado como tomado',
    });
  } catch (error) {
    console.error('Error marking taken:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao marcar medicamento',
    });
  }
});

// Marcar medicamento como não tomado/perdido
router.post('/mark-missed', authMiddleware, async (req, res) => {
  try {
    const { medication_id, scheduled_date, scheduled_time, notes } = req.body;

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

    // Verificar se já existe registro
    const existing = await query(
      `SELECT id FROM medication_history 
       WHERE medication_id = ? AND user_id = ? AND scheduled_date = ? AND scheduled_time = ?`,
      [medication_id, req.userId, scheduled_date, scheduled_time]
    );

    if (existing.length > 0) {
      // Atualizar registro existente
      await query(
        `UPDATE medication_history SET status = 'missed', notes = ? 
         WHERE id = ?`,
        [notes || null, existing[0].id]
      );
    } else {
      // Criar novo registro
      await query(
        `INSERT INTO medication_history (medication_id, user_id, scheduled_date, scheduled_time, status, notes)
         VALUES (?, ?, ?, ?, 'missed', ?)`,
        [medication_id, req.userId, scheduled_date, scheduled_time, notes || null]
      );
    }

    res.json({
      success: true,
      message: 'Medicamento marcado como não tomado',
    });
  } catch (error) {
    console.error('Error marking missed:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao marcar medicamento como não tomado',
    });
  }
});

// Obter resumo mensal
router.get('/summary/monthly', authMiddleware, async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const currentMonth = month || String(currentDate.getMonth() + 1).padStart(2, '0');
    const currentYear = year || currentDate.getFullYear();

    const summary = await query(
      `SELECT 
        DATE(scheduled_date) as date,
        status,
        COUNT(*) as count
       FROM medication_history
       WHERE user_id = ? 
         AND MONTH(scheduled_date) = ?
         AND YEAR(scheduled_date) = ?
       GROUP BY DATE(scheduled_date), status
       ORDER BY scheduled_date ASC`,
      [req.userId, currentMonth, currentYear]
    );

    res.json({
      success: true,
      summary,
      month: currentMonth,
      year: currentYear,
    });
  } catch (error) {
    console.error('Error getting summary:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter resumo',
    });
  }
});

// Limpar histórico do usuário
router.delete('/clear', authMiddleware, async (req, res) => {
  try {
    await query(
      'DELETE FROM medication_history WHERE user_id = ?',
      [req.userId]
    );

    res.json({
      success: true,
      message: 'Histórico limpo com sucesso',
    });
  } catch (error) {
    console.error('Error clearing history:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao limpar histórico',
    });
  }
});

module.exports = router;

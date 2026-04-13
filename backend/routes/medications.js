const express = require('express');
const authMiddleware = require('../middleware/auth');
const { query } = require('../utils/database');

const router = express.Router();

// Listar medicamentos do usuário
router.get('/', authMiddleware, async (req, res) => {
  try {
    const medications = await query(
      `SELECT m.*, 
              COUNT(DISTINCT ms.id) as schedule_count,
              GROUP_CONCAT(ms.scheduled_time) as times
       FROM medications m
       LEFT JOIN medication_schedules ms ON m.id = ms.medication_id
       WHERE m.user_id = ? AND (m.end_date IS NULL OR m.end_date >= CURDATE())
       GROUP BY m.id
       ORDER BY m.created_at DESC`,
      [req.userId]
    );

    res.json({
      success: true,
      medications,
    });
  } catch (error) {
    console.error('Error listing medications:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar medicamentos',
    });
  }
});

// Criar medicamento
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      dosage,
      unit,
      frequency,
      start_date,
      end_date,
      notes,
    } = req.body;

    const result = await query(
      `INSERT INTO medications (user_id, name, description, dosage, unit, frequency, start_date, end_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.userId,
        name,
        description,
        dosage,
        unit,
        frequency,
        start_date,
        end_date,
        notes,
      ]
    );

    res.status(201).json({
      success: true,
      medication_id: result.insertId,
      message: 'Medicamento criado com sucesso',
    });
  } catch (error) {
    console.error('Error creating medication:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar medicamento',
    });
  }
});

// Obter detalhes de um medicamento
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const medications = await query(
      'SELECT * FROM medications WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );

    if (medications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Medicamento não encontrado',
      });
    }

    res.json({
      success: true,
      medication: medications[0],
    });
  } catch (error) {
    console.error('Error getting medication:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter medicamento',
    });
  }
});

// Atualizar medicamento
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      dosage,
      unit,
      frequency,
      start_date,
      end_date,
      notes,
    } = req.body;

    await query(
      `UPDATE medications SET 
        name = ?, description = ?, dosage = ?, unit = ?, frequency = ?,
        start_date = ?, end_date = ?, notes = ?
       WHERE id = ? AND user_id = ?`,
      [
        name,
        description,
        dosage,
        unit,
        frequency,
        start_date,
        end_date,
        notes,
        req.params.id,
        req.userId,
      ]
    );

    res.json({
      success: true,
      message: 'Medicamento atualizado com sucesso',
    });
  } catch (error) {
    console.error('Error updating medication:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar medicamento',
    });
  }
});

// Deletar medicamento
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await query(
      'DELETE FROM medications WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );

    res.json({
      success: true,
      message: 'Medicamento deletado com sucesso',
    });
  } catch (error) {
    console.error('Error deleting medication:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar medicamento',
    });
  }
});

module.exports = router;

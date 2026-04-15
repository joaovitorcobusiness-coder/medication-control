const express = require('express');
const authMiddleware = require('../middleware/auth');
const { query } = require('../utils/database');

const router = express.Router();

// Obter perfil do usuário
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const results = await query('SELECT * FROM users WHERE id = ?', [req.userId]);
    
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    const user = results[0];
    delete user.password; // Não enviar senha

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter perfil',
    });
  }
});

// Atualizar perfil do usuário
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      phone,
      cpf,
      date_of_birth,
      address,
      city,
      state,
      zip_code,
      emergency_contact,
      emergency_phone,
      caregiver_email,
    } = req.body;

    await query(
      `UPDATE users SET 
        name = ?, phone = ?, cpf = ?, date_of_birth = ?, 
        address = ?, city = ?, state = ?, zip_code = ?,
        emergency_contact = ?, emergency_phone = ?, caregiver_email = ?
       WHERE id = ?`,
      [
        name,
        phone,
        cpf,
        date_of_birth,
        address,
        city,
        state,
        zip_code,
        emergency_contact,
        emergency_phone,
        caregiver_email,
        req.userId,
      ]
    );

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar perfil',
    });
  }
});

// Obter estatísticas do usuário
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Total de medicamentos hoje
    const totalToday = await query(
      `SELECT COUNT(*) as count FROM medication_history 
       WHERE user_id = ? AND scheduled_date = ? AND status IN ('pending', 'taken')`,
      [req.userId, today]
    );

    // Medicamentos tomados hoje
    const taken = await query(
      `SELECT COUNT(*) as count FROM medication_history 
       WHERE user_id = ? AND scheduled_date = ? AND status = 'taken'`,
      [req.userId, today]
    );

    // Medicamentos pendentes hoje
    const pending = await query(
      `SELECT COUNT(*) as count FROM medication_history 
       WHERE user_id = ? AND scheduled_date = ? AND status = 'pending'`,
      [req.userId, today]
    );

    res.json({
      success: true,
      stats: {
        total_today: totalToday[0]?.count || 0,
        taken: taken[0]?.count || 0,
        pending: pending[0]?.count || 0,
      },
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter estatísticas',
    });
  }
});

// Listar todos os usuários (para admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const results = await query(
      'SELECT id, name, email, phone, cpf, created_at FROM users ORDER BY created_at DESC'
    );
    
    res.json({
      success: true,
      users: results,
    });
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar usuários',
    });
  }
});

// Rota temporária para teste sem autenticação
router.get('/public', async (req, res) => {
  try {
    const results = await query(
      'SELECT id, name, email, phone, cpf, created_at FROM users ORDER BY created_at DESC'
    );
    
    res.json({
      success: true,
      users: results,
    });
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar usuários',
    });
  }
});

module.exports = router;

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../utils/database');
const { body, validationResult } = require('express-validator');

const router = express.Router();

const DEMO_ACCOUNTS = {
  'funcionario@teste.com': { name: 'Funcionário Teste', password: 'Funcionario@123', role: 'funcionario' },
  'paciente@teste.com': { name: 'Paciente Teste', password: 'Paciente@123', role: 'patient' },
  'cuidador@teste.com': { name: 'Cuidador Teste', password: 'Cuidador@123', role: 'caregiver' },
  'familiar@teste.com': { name: 'Familiar Teste', password: 'Familiar@123', role: 'family' },
};

const getUserRole = (email) => {
  const normalizedEmail = String(email || '').toLowerCase();

  if (normalizedEmail.includes('funcionario') || normalizedEmail.includes('admin')) return 'funcionario';
  if (normalizedEmail.includes('paciente')) return 'patient';
  if (normalizedEmail.includes('cuidador')) return 'caregiver';
  if (normalizedEmail.includes('familiar')) return 'family';

  return 'user';
};

const getDemoUser = (email, password) => {
  const demoUser = DEMO_ACCOUNTS[email.toLowerCase()];

  if (!demoUser || demoUser.password !== password) {
    return null;
  }

  return {
    id: 0,
    name: demoUser.name,
    email,
    phone: '11999990000',
    role: demoUser.role,
  };
};

// Login
router.post('/login', 
  body('email').isEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const demoUser = getDemoUser(email, password);

      if (demoUser) {
        const token = jwt.sign(
          { userId: demoUser.id, email: demoUser.email, role: demoUser.role },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '7d' }
        );

        return res.json({
          success: true,
          token,
          user: demoUser,
        });
      }
      
      const results = await query('SELECT * FROM users WHERE email = ?', [email]);
      
      if (results.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Email ou senha inválidos',
        });
      }

      const user = results[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Email ou senha inválidos',
        });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: getUserRole(user.email),
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao fazer login',
      });
    }
  }
);

// Register
router.post('/register',
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('date_of_birth').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { name, email, password, date_of_birth, phone, cpf } = req.body;
      
      // Verificar se email já existe
      const existingUser = await query('SELECT id FROM users WHERE email = ?', [email]);
      if (existingUser.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email já cadastrado',
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Inserir usuário
      await query(
        'INSERT INTO users (name, email, password, date_of_birth, phone, cpf) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email, hashedPassword, date_of_birth, phone, cpf]
      );

      res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso',
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao registrar usuário',
      });
    }
  }
);

module.exports = router;
module.exports.getDemoUser = getDemoUser;
module.exports.getUserRole = getUserRole;
module.exports.DEMO_ACCOUNTS = DEMO_ACCOUNTS;

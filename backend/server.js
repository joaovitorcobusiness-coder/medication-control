const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const iotService = require('./services/iotNotificationService');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar rotas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const medicationRoutes = require('./routes/medications');
const scheduleRoutes = require('./routes/schedules');
const historyRoutes = require('./routes/history');
const iotRoutes = require('./routes/iot');
const { query } = require('./utils/database');

// Usar rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/iot', iotRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Export connection pool para reutilizar
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'medication_control',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.locals.pool = pool;

const PORT = process.env.PORT || 5001;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Inicializar serviço de notificações IoT
  await iotService.initialize();
  
  // Agendar criação de lembretes automáticos diariamente às 22:00
  const schedule = require('node-schedule');
  schedule.scheduleJob('0 22 * * *', async () => {
    await iotService.createMedicationReminders();
  });
});

// Health check
app.get('/api/dbteste', async (req, res) => {
  try {
    const results = await query('SELECT * FROM users');
    
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
      stack: error.stack,
      error: error.message,
      errorCode: error.code,
      erro: error,

    });
  }
});

module.exports = app;

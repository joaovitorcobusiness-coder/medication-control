const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuração da conexão MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'medication_control',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Criar pool de conexões
const pool = mysql.createPool(dbConfig);

// Função para executar queries
const query = async (sql, values = []) => {
  try {
    const [rows] = await pool.execute(sql, values);
    return rows;
  } catch (error) {
    console.error('Erro na query:', error);
    throw error;
  }
};

// Inicializar conexão
const initDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Conectado ao MySQL');
    connection.release();
  } catch (error) {
    console.error('Erro ao conectar ao MySQL:', error);
    throw error;
  }
};

// Inserir dados iniciais se necessário
const seedDB = async () => {
  try {
    // Verificar se já existem usuários
    const users = await query('SELECT COUNT(*) as count FROM users');
    if (users[0].count === 0) {
      // Inserir usuários de exemplo
      const hashedPassword = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // password: password
      await query(
        'INSERT INTO users (name, email, password, phone, cpf, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        ['João Silva', 'joao@teste.com', hashedPassword, '11999999999', '12345678901', new Date()]
      );
      await query(
        'INSERT INTO users (name, email, password, phone, cpf, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        ['Maria Santos', 'maria@teste.com', hashedPassword, '11888888888', '98765432109', new Date()]
      );
      console.log('Dados iniciais inseridos');
    }
  } catch (error) {
    console.error('Erro ao inserir dados iniciais:', error);
  }
};

// Inicializar
initDB().then(seedDB).catch(console.error);

module.exports = { query };

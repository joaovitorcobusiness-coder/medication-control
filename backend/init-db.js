const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'medication_control.db');

// Criar diretório se não existir
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao criar banco:', err.message);
    return;
  }
  console.log('Banco SQLite criado com sucesso!');
});

// Schema adaptado para SQLite
const schema = `
-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    date_of_birth TEXT,
    phone TEXT,
    cpf TEXT UNIQUE,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    emergency_contact TEXT,
    emergency_phone TEXT,
    caregiver_email TEXT,
    profile_photo BLOB,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de medicamentos
CREATE TABLE IF NOT EXISTS medications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    dosage TEXT,
    unit TEXT,
    frequency TEXT,
    start_date TEXT,
    end_date TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de agendamentos de medicamentos
CREATE TABLE IF NOT EXISTS medication_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    medication_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    scheduled_time TEXT NOT NULL,
    day_of_week TEXT,
    reminder_enabled INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de histórico de medicamentos
CREATE TABLE IF NOT EXISTS medication_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    medication_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    scheduled_date TEXT NOT NULL,
    scheduled_time TEXT NOT NULL,
    taken_time TEXT,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de dispositivos IoT
CREATE TABLE IF NOT EXISTS iot_devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    device_id TEXT UNIQUE NOT NULL,
    device_name TEXT,
    device_type TEXT DEFAULT 'mobile',
    platform TEXT,
    token TEXT,
    is_active INTEGER DEFAULT 1,
    last_connected DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de notificações IoT
CREATE TABLE IF NOT EXISTS iot_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    medication_id INTEGER,
    device_id TEXT,
    notification_type TEXT DEFAULT 'reminder',
    title TEXT,
    message TEXT,
    is_sent INTEGER DEFAULT 0,
    sent_at DATETIME,
    scheduled_for DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE SET NULL
);

-- Inserir usuário de teste
INSERT OR IGNORE INTO users (name, email, password, phone) VALUES
('Admin', 'admin@teste.com', '$2a$10$hashedpassword', '11999999999');
`;

db.serialize(() => {
  db.exec(schema, (err) => {
    if (err) {
      console.error('Erro ao executar schema:', err.message);
    } else {
      console.log('Schema executado com sucesso!');
    }
    db.close((err) => {
      if (err) {
        console.error('Erro ao fechar banco:', err.message);
      } else {
        console.log('Banco fechado.');
      }
    });
  });
});
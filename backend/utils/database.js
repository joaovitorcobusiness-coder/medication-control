const fs = require('fs').promises;
const path = require('path');

const DB_FILE = path.join(__dirname, '..', '..', 'database', 'db.json');

// Garantir que o diretório existe
const dbDir = path.dirname(DB_FILE);
if (!fs.access(dbDir).catch(() => true)) {
  require('fs').mkdirSync(dbDir, { recursive: true });
}

let db = { users: [], medications: [], medication_schedules: [], medication_history: [], iot_devices: [], iot_notifications: [] };

// Carregar dados do arquivo
const loadDB = async () => {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    db = JSON.parse(data);
  } catch (err) {
    // Arquivo não existe, usar dados padrão
    db = {
      users: [
        {
          id: 1,
          name: 'João Silva',
          email: 'joao@teste.com',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
          phone: '11999999999',
          cpf: '12345678901',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Maria Santos',
          email: 'maria@teste.com',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
          phone: '11888888888',
          cpf: '98765432109',
          created_at: new Date().toISOString()
        }
      ],
      medications: [],
      medication_schedules: [],
      medication_history: [],
      iot_devices: [],
      iot_notifications: []
    };
    await saveDB();
  }
};

// Salvar dados no arquivo
const saveDB = async () => {
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
};

// Inicializar
loadDB();

const query = async (sql, values = []) => {
  // Simulação simples de queries SQL para JSON
  const sqlLower = sql.toLowerCase().trim();

  if (sqlLower.includes('select * from users')) {
    return db.users;
  }

  if (sqlLower.includes('select * from users where id = ?')) {
    const userId = values[0];
    return db.users.filter(u => u.id == userId);
  }

  if (sqlLower.includes('select * from users where email = ?')) {
    const email = values[0];
    return db.users.filter(u => u.email === email);
  }

  if (sqlLower.includes('insert into users')) {
    const newUser = {
      id: Math.max(...db.users.map(u => u.id), 0) + 1,
      ...values[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.users.push(newUser);
    await saveDB();
    return { insertId: newUser.id };
  }

  if (sqlLower.includes('update users set')) {
    const userId = values[values.length - 1];
    const userIndex = db.users.findIndex(u => u.id == userId);
    if (userIndex !== -1) {
      Object.assign(db.users[userIndex], values[0], { updated_at: new Date().toISOString() });
      await saveDB();
    }
    return { affectedRows: 1 };
  }

  if (sqlLower.includes('select * from iot_devices')) {
    return db.iot_devices;
  }

  if (sqlLower.includes('insert into iot_devices')) {
    const newDevice = {
      id: Math.max(...db.iot_devices.map(d => d.id), 0) + 1,
      ...values[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.iot_devices.push(newDevice);
    await saveDB();
    return { insertId: newDevice.id };
  }

  if (sqlLower.includes('delete from iot_devices where device_id = ?')) {
    const deviceId = values[0];
    const initialLength = db.iot_devices.length;
    db.iot_devices = db.iot_devices.filter(d => d.device_id !== deviceId);
    await saveDB();
    return { affectedRows: initialLength - db.iot_devices.length };
  }

  // Queries não implementadas retornam array vazio
  return [];
};

module.exports = { query };

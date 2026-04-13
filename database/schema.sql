-- Banco de dados para controle de medicamentos
CREATE DATABASE IF NOT EXISTS medication_control;
USE medication_control;

-- Tabela de usuários
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    phone VARCHAR(20),
    cpf VARCHAR(14) UNIQUE,
    address VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    emergency_contact VARCHAR(255),
    emergency_phone VARCHAR(20),
    caregiver_email VARCHAR(255),
    profile_photo LONGBLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de medicamentos
CREATE TABLE medications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    dosage VARCHAR(100),
    unit VARCHAR(50),
    frequency VARCHAR(100),
    start_date DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de agendamentos de medicamentos
CREATE TABLE medication_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medication_id INT NOT NULL,
    user_id INT NOT NULL,
    scheduled_time TIME NOT NULL,
    day_of_week VARCHAR(100),
    reminder_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de histórico de medicamentos (tomados/não tomados)
CREATE TABLE medication_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medication_id INT NOT NULL,
    user_id INT NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    taken_time TIME,
    status ENUM('pending', 'taken', 'missed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, scheduled_date)
);

-- Tabela de notificações IoT
CREATE TABLE iot_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    medication_id INT,
    device_id VARCHAR(255),
    notification_type ENUM('reminder', 'alert', 'info') DEFAULT 'reminder',
    title VARCHAR(255),
    message TEXT,
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP NULL,
    scheduled_for DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE SET NULL,
    INDEX idx_user_scheduled (user_id, scheduled_for)
);

-- Tabela de dispositivos IoT
CREATE TABLE iot_devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    device_id VARCHAR(255) UNIQUE NOT NULL,
    device_name VARCHAR(255),
    device_type ENUM('mobile', 'smartwatch', 'speaker', 'other') DEFAULT 'mobile',
    platform VARCHAR(50),
    token VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    last_connected TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- Tabela de logs de atividade
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(255),
    description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_created (user_id, created_at)
);

-- Índices adicionais para performance
CREATE INDEX idx_medications_user ON medications(user_id);
CREATE INDEX idx_schedules_medication ON medication_schedules(medication_id);
CREATE INDEX idx_history_user_date ON medication_history(user_id, scheduled_date);
CREATE INDEX idx_notifications_user ON iot_notifications(user_id);

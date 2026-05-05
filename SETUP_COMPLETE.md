# 📋 Setup Completo do Sistema

## Índice
1. [Banco de Dados](#banco-de-dados)
2. [Backend API](#backend-api)
3. [Frontend Web](#frontend-web)
4. [Caixa IoT (ESP32)](#caixa-iot-esp32)
5. [Testes](#testes)
6. [Troubleshooting](#troubleshooting)

---

## 🗄️ Banco de Dados

### Pré-requisitos
- MySQL 5.7+ ou MariaDB 10.3+
- Cliente MySQL instalado

### Instalação

#### Opção 1: Via Command Line
```bash
# Abrir MySQL
mysql -u root -p

# Criar base de dados e executar schema
CREATE DATABASE medication_control;
USE medication_control;
SOURCE D:\copilot\database\schema.sql;

# Verificar tabelas
SHOW TABLES;
EXIT;
```

#### Opção 2: Via MySQL Workbench
1. Abrir MySQL Workbench
2. File → Open SQL Script
3. Selecionar `D:\copilot\database\schema.sql`
4. Execute (Ctrl+Shift+Enter)

#### Verificação
```sql
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'medication_control';
```

Você deve ver as tabelas:
- users
- medications
- medication_schedules
- medication_history
- iot_devices
- iot_notifications
- iot_events
- activity_logs

---

## 🔌 Backend API

### Pré-requisitos
- Node.js 14.0+ 
- npm ou yarn
- MySQL rodando

### Instalação Passo a Passo

```bash
# 1. Navegar para pasta backend
cd D:\copilot\backend

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
# Criar arquivo .env (ou editar o existente)
# Adicionar:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=medication_control
PORT=5000
NODE_ENV=development
JWT_SECRET=sua-chave-super-secreta-aqui-mudar-em-producao
FCM_SERVER_KEY=sua-chave-firebase-aqui
FRONTEND_URL=http://localhost:3000

# 4. Iniciar servidor de desenvolvimento
npm run dev

# Ou em produção
npm start
```

### Verificar Status

Abrir navegador em `http://localhost:5000/api/health`

Resposta esperada:
```json
{
  "status": "Server is running",
  "timestamp": "2026-05-05T14:30:00.000Z"
}
```

### Rotas Principais

#### Autenticação
- **POST** `/api/auth/register` - Registrar novo usuário
- **POST** `/api/auth/login` - Login
- **POST** `/api/auth/refresh` - Renovar token

#### Medicamentos
- **GET** `/api/medications` - Listar medicamentos
- **POST** `/api/medications` - Criar medicamento
- **PUT** `/api/medications/:id` - Atualizar medicamento
- **DELETE** `/api/medications/:id` - Deletar medicamento

#### Agendamentos
- **GET** `/api/schedules` - Listar agendamentos
- **GET** `/api/schedules/today` - Agendamentos de hoje
- **POST** `/api/schedules` - Criar agendamento
- **PUT** `/api/schedules/:id` - Atualizar
- **DELETE** `/api/schedules/:id` - Deletar

#### Histórico
- **GET** `/api/history` - Obter histórico
- **POST** `/api/history/mark-taken` - Marcar como tomado
- **POST** `/api/history/mark-missed` - Marcar como não tomado

#### IoT
- **POST** `/api/iot/devices/register` - Registrar dispositivo IoT
- **GET** `/api/iot/devices` - Listar dispositivos
- **DELETE** `/api/iot/devices/:id` - Deletar dispositivo
- **POST** `/api/iot/events` - Registrar evento IoT (caixa aberta, medicamento tomado)
- **GET** `/api/iot/events/:device_id` - Obter eventos do dispositivo
- **POST** `/api/iot/notifications/schedule` - Agendar notificação
- **POST** `/api/iot/notifications/process` - Processar notificações pendentes

---

## 💻 Frontend Web

### Pré-requisitos
- Node.js 14.0+
- npm ou yarn

### Instalação

```bash
# 1. Navegar para pasta frontend
cd D:\copilot\frontend

# 2. Instalar dependências
npm install

# 3. Configurar API URL
# Editar D:\copilot\frontend\src\services\api.js
# Verificar:
const API_URL = 'http://localhost:5000/api';

# 4. Iniciar servidor de desenvolvimento
npm start
```

Frontend estará em: `http://localhost:3000`

### Páginas Disponíveis

1. **Autenticação**
   - `/login` - Login
   - `/register` - Registrar novo usuário

2. **Usuário Idoso**
   - `/dashboard` - Dashboard com medicamentos do dia
   - `/medications` - Gerenciar medicamentos
   - `/settings` - Configurações
   - `/profile` - Perfil do usuário

3. **Familiar/Cuidador**
   - `/admin` - Painel administrativo
   - `admin/patients` - Gerenciar pacientes
   - `/admin/reports` - Relatórios de adesão

4. **Geral**
   - `/history` - Histórico de medicamentos
   - `/logout` - Sair

---

## 🤖 Caixa IoT (ESP32)

### Hardware

#### Componentes Necessários
- 1x ESP32 Development Board
- 1x Sensor Reed Switch (magnético)
- 1x LED (qualquer cor)
- 1x Buzzer (ativo ou passivo 5V)
- 1x Botão de pressão
- 1x Resistor 10kΩ
- Jumpers e protoboard

#### Esquema de Ligação

```
ESP32              Componente
────────────────────────────────
GPIO 34      ←→   Sensor Reed Switch
GPIO 2       ←→   LED  + 220Ω resistor
GPIO 4       ←→   Buzzer
GPIO 35      ←→   Botão de Pressão
GND          ←→   GND (todos)
5V           ←→   5V (alimentação)
```

### Instalação do Firmware

#### Passo 1: Instalar Arduino IDE
1. Baixar em https://www.arduino.cc/en/software
2. Instalar

#### Passo 2: Adicionar Suporte ESP32
```
Arduino IDE → File → Preferences
Em "Additional Boards Manager URLs", adicionar:
https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json

Tools → Board → Board Manager
Procurar "esp32" e instalar
```

#### Passo 3: Instalar Bibliotecas
```
Sketch → Include Library → Manage Libraries

Procurar e instalar:
- ArduinoJson (versão 6.19.0+)
- (WiFi.h já vem com ESP32)
```

#### Passo 4: Carregar Firmware
```
1. Abrir D:\copilot\iot\firmware_esp32_medication_box.ino no Arduino IDE

2. Editar Configurações (linhas 15-27):
   const char* SSID = "seu-wifi-ssid";
   const char* PASSWORD = "sua-senha-wifi";
   const char* DEVICE_ID = "esp32-medication-box-001";

3. Conectar ESP32 ao PC via USB

4. Tools → Board: "ESP32 Dev Module"
5. Tools → Upload Speed: 115200
6. Tools → Port: COMX (select correct port)

7. Sketch → Upload (ou Ctrl+U)

8. Tools → Serial Monitor (115200 baud)
```

#### Verificação
No Serial Monitor deve aparecer:
```
Inicializando Sistema IoT de Caixa de Medicamentos...
Conectando ao Wi-Fi: Minha-Rede
.....
Wi-Fi conectado!
IP: 192.168.1.100
Aguardando sincronização de horário...
Horário sincronizado!
Hora atual: 2026-05-05 14:30:00
```

### Funcionamento

#### Quando a Caixa é Aberta
1. Sensor detecta abertura
2. LED pisca 5 vezes
3. Buzzer toca (frequência 1000-2000 Hz)
4. Espera detecção de fechamento

#### Confirmação de Medicamento Tomado
- Caixa permanece aberta por 2+ segundos → registra como "taken"
- Ou usuário pressiona botão de confirmação

#### Eventos Registrados
- `opened` - Caixa aberta
- `taken` - Medicamento confirmado como tomado
- `late` - Medicamento tomado com atraso
- `missed` - Medicamento não tomado

---

## ✅ Testes

### 1. Teste da API

#### Registrar Usuário
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "senha123",
    "date_of_birth": "1950-01-15"
  }'
```

Resposta esperada:
```json
{
  "success": true,
  "message": "Usuário registrado com sucesso",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@example.com"
  }
}
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

#### Criar Medicamento
```bash
curl -X POST http://localhost:5000/api/medications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "name": "Dipirona",
    "dosage": "500mg",
    "frequency": "a cada 6 horas",
    "notes": "Tomar com água"
  }'
```

#### Criar Agendamento
```bash
curl -X POST http://localhost:5000/api/schedules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "medication_id": 1,
    "scheduled_time": "08:00:00",
    "day_of_week": "Monday,Tuesday,Wednesday,Thursday,Friday",
    "reminder_enabled": true
  }'
```

#### Registrar Dispositivo IoT
```bash
curl -X POST http://localhost:5000/api/iot/devices/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "device_id": "esp32-medication-box-001",
    "device_name": "Caixa de Medicamentos",
    "device_type": "box",
    "platform": "esp32",
    "token": "seu-fcm-token"
  }'
```

#### Simular Evento IoT
```bash
curl -X POST http://localhost:5000/api/iot/events \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "esp32-medication-box-001",
    "compartment_id": 1,
    "event_type": "taken",
    "description": "Medicamento tomado",
    "timestamp": "2026-05-05 14:30:00"
  }'
```

### 2. Teste do Frontend

1. Abrir http://localhost:3000
2. Registrar novo usuário
3. Fazer login
4. Criar medicamento
5. Agendar horários
6. Marcar como tomado

### 3. Teste do IoT (ESP32)

1. **Serial Monitor Test**
   - Abrir Serial Monitor (115200 baud)
   - Verificar logs de inicialização

2. **Test Manual da Caixa**
   - Abrir a caixa → LED pisca + Buzzer toca
   - Fechar por 2+ segundos → Evento enviado
   - Pressionar botão → Evento manual enviado

3. **Test de Conectividade**
   - Abrir Serial Monitor
   - Verificar se conectou ao Wi-Fi
   - Verificar IP local

---

## 🛠️ Troubleshooting

### Backend

#### Erro: "Conexão recusada ao MySQL"
```
Solução:
1. Verificar se MySQL está rodando
2. Verificar credenciais em .env
3. Verificar se banco "medication_control" existe
```

#### Erro: "EADDRINUSE: address already in use :::5000"
```
Solução:
# Matar processo na porta 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Ou mudar porta em .env
PORT=5001
```

#### Erro: "JWT_SECRET não definido"
```
Solução:
1. Editar .env
2. Adicionar: JWT_SECRET=sua-chave-secreta-aqui
3. Reiniciar servidor
```

### Frontend

#### Erro: "Cannot GET /"
```
Solução:
1. Verificar se npm start foi executado
2. Abrir em http://localhost:3000
3. Verificar console (F12) para erros
```

#### Erro: "API connection refused"
```
Solução:
1. Verificar se backend está rodando (http://localhost:5000/api/health)
2. Verificar URL em src/services/api.js
3. Verificar CORS headers no backend
```

### IoT (ESP32)

#### Erro: "Não conecta ao Wi-Fi"
```
Solução:
1. Verificar SSID e senha (linhas 16-17)
2. Verificar se Wi-Fi é 2.4GHz (ESP32 não suporta 5GHz)
3. Verificar sinal Wi-Fi (RSSI > -90dBm)
4. Fazer reset: botão RST do ESP32
```

#### Erro: "Sensor não detecta abertura"
```
Solução:
1. Testar com multímetro (continuidade)
2. Verificar se reed switch está bem posicionado
3. Testar com imã perto do sensor
4. Trocar GPIO 34 se defeituoso
```

#### Erro: "Buzzer não toca / LED não acende"
```
Solução:
1. Verificar GPIO corretos (2 = LED, 4 = Buzzer)
2. Verificar alimentação (5V presente?)
3. Testar com multímetro
4. Verificar polaridade (LED tem + e -)
```

---

## 📞 Suporte e Documentação Adicional

- **API Docs**: Veja [API_EXAMPLES.md](API_EXAMPLES.md)
- **ESP32 Setup**: Veja [iot/README_ESP32.md](iot/README_ESP32.md)
- **Quick Start**: Veja [QUICKSTART.md](QUICKSTART.md)

---

**Sistema desenvolvido con ❤️ para cuidar da saúde dos idosos**

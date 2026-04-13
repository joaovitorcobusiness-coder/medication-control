# Exemplos de Uso da API - Meus Remédios

## 📌 Índice

1. [Autenticação](#autenticação)
2. [Usuários](#usuários)
3. [Medicamentos](#medicamentos)
4. [Agendamentos](#agendamentos)
5. [Histórico](#histórico)
6. [IoT & Notificações](#iot--notificações)

---

## 🔐 Autenticação

### Registrar Usuário

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Silva",
    "email": "maria@example.com",
    "password": "senha123",
    "date_of_birth": "1950-05-15",
    "phone": "(11) 98765-4321",
    "cpf": "123.456.789-00"
  }'
```

**Resposta:**
```json
{
  "success": true,
  "message": "Usuário registrado com sucesso"
}
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@example.com",
    "password": "senha123"
  }'
```

**Resposta:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Maria Silva",
    "email": "maria@example.com",
    "phone": "(11) 98765-4321"
  }
}
```

**Salvar token:**
```bash
# Adicione a este token em todas as requisições subsequentes:
Authorization: Bearer {token}
```

---

## 👤 Usuários

### Obter Perfil

```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer {token}"
```

**Resposta:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Maria Silva",
    "email": "maria@example.com",
    "date_of_birth": "1950-05-15",
    "phone": "(11) 98765-4321",
    "cpf": "123.456.789-00",
    "address": "Rua A, 123",
    "city": "São Paulo",
    "state": "SP",
    "zip_code": "01234-567",
    "emergency_contact": "João Silva",
    "emergency_phone": "(11) 87654-3210"
  }
}
```

### Atualizar Perfil

```bash
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Silva",
    "phone": "(11) 99999-8888",
    "address": "Rua B, 456",
    "city": "São Paulo",
    "state": "SP",
    "zip_code": "01234-567",
    "emergency_contact": "João Silva",
    "emergency_phone": "(11) 87654-3210"
  }'
```

### Obter Estatísticas

```bash
curl -X GET http://localhost:5000/api/users/stats \
  -H "Authorization: Bearer {token}"
```

**Resposta:**
```json
{
  "success": true,
  "stats": {
    "total_today": 3,
    "taken": 1,
    "pending": 2
  }
}
```

---

## 💊 Medicamentos

### Listar Medicamentos

```bash
curl -X GET http://localhost:5000/api/medications \
  -H "Authorization: Bearer {token}"
```

**Resposta:**
```json
{
  "success": true,
  "medications": [
    {
      "id": 1,
      "name": "Dipirona",
      "description": "Analgésico e antipirético",
      "dosage": "500",
      "unit": "mg",
      "frequency": "2x ao dia",
      "start_date": "2026-01-01",
      "end_date": null,
      "notes": "Tomar com água",
      "schedule_count": 4
    }
  ]
}
```

### Criar Medicamento

```bash
curl -X POST http://localhost:5000/api/medications \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Metformina",
    "description": "Controle de diabetes",
    "dosage": "500",
    "unit": "mg",
    "frequency": "3x ao dia",
    "start_date": "2026-04-13",
    "end_date": null,
    "notes": "Tomar com as refeições"
  }'
```

**Resposta:**
```json
{
  "success": true,
  "medication_id": 2,
  "message": "Medicamento criado com sucesso"
}
```

### Atualizar Medicamento

```bash
curl -X PUT http://localhost:5000/api/medications/1 \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dipirona",
    "dosage": "750",
    "unit": "mg",
    "frequency": "3x ao dia"
  }'
```

### Deletar Medicamento

```bash
curl -X DELETE http://localhost:5000/api/medications/1 \
  -H "Authorization: Bearer {token}"
```

---

## ⏰ Agendamentos

### Listar Agendamentos

```bash
curl -X GET http://localhost:5000/api/schedules \
  -H "Authorization: Bearer {token}"
```

**Resposta:**
```json
{
  "success": true,
  "schedules": [
    {
      "id": 1,
      "medication_id": 1,
      "medication_name": "Dipirona",
      "scheduled_time": "08:00",
      "day_of_week": "Monday,Tuesday,Wednesday",
      "reminder_enabled": true
    }
  ]
}
```

### Agendamentos de Hoje

```bash
curl -X GET http://localhost:5000/api/schedules/today \
  -H "Authorization: Bearer {token}"
```

**Resposta:**
```json
{
  "success": true,
  "date": "2026-04-13",
  "schedules": [
    {
      "id": 1,
      "medication_id": 1,
      "medication_name": "Dipirona",
      "dosage": "500",
      "unit": "mg",
      "scheduled_time": "08:00",
      "status": "pending"
    },
    {
      "id": 2,
      "medication_id": 1,
      "medication_name": "Dipirona",
      "dosage": "500",
      "unit": "mg",
      "scheduled_time": "14:00",
      "status": "taken",
      "taken_time": "14:05"
    }
  ]
}
```

### Criar Agendamento

```bash
curl -X POST http://localhost:5000/api/schedules \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "medication_id": 1,
    "scheduled_time": "08:00",
    "day_of_week": "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday",
    "reminder_enabled": true
  }'
```

### Criar Agendamento Específico

```json
{
  "medication_id": 2,
  "scheduled_time": "07:30",
  "day_of_week": "Monday,Tuesday,Wednesday,Thursday,Friday",
  "reminder_enabled": true
}
```

---

## 📋 Histórico

### Listar Histórico

```bash
curl -X GET "http://localhost:5000/api/history?start_date=2026-04-01&end_date=2026-04-30" \
  -H "Authorization: Bearer {token}"
```

**Resposta:**
```json
{
  "success": true,
  "history": [
    {
      "id": 1,
      "medication_id": 1,
      "medication_name": "Dipirona",
      "dosage": "500",
      "unit": "mg",
      "scheduled_date": "2026-04-13",
      "scheduled_time": "08:00",
      "taken_time": "08:05",
      "status": "taken",
      "notes": null
    },
    {
      "id": 2,
      "medication_id": 1,
      "medication_name": "Dipirona",
      "dosage": "500",
      "unit": "mg",
      "scheduled_date": "2026-04-13",
      "scheduled_time": "14:00",
      "taken_time": null,
      "status": "missed",
      "notes": "Esqueceu de tomar"
    }
  ]
}
```

### Marcar como Tomado

```bash
curl -X POST http://localhost:5000/api/history/mark-taken \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "medication_id": 1,
    "scheduled_date": "2026-04-13",
    "scheduled_time": "08:00"
  }'
```

### Marcar como Não Tomado

```bash
curl -X POST http://localhost:5000/api/history/mark-missed \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "medication_id": 1,
    "scheduled_date": "2026-04-13",
    "scheduled_time": "14:00",
    "notes": "Saiu de casa e esqueceu"
  }'
```

### Resumo Mensal

```bash
curl -X GET "http://localhost:5000/api/history/summary/monthly?month=04&year=2026" \
  -H "Authorization: Bearer {token}"
```

**Resposta:**
```json
{
  "success": true,
  "month": "04",
  "year": 2026,
  "summary": [
    {
      "date": "2026-04-01",
      "status": "taken",
      "count": 2
    },
    {
      "date": "2026-04-01",
      "status": "missed",
      "count": 1
    }
  ]
}
```

---

## 🚀 IoT & Notificações

### Registrar Dispositivo

```bash
curl -X POST http://localhost:5000/api/iot/devices/register \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "device-uuid-123",
    "device_name": "Meu Samsung S21",
    "device_type": "mobile",
    "platform": "android",
    "token": "firebase-cloud-messaging-token-aqui"
  }'
```

### Listar Dispositivos

```bash
curl -X GET http://localhost:5000/api/iot/devices \
  -H "Authorization: Bearer {token}"
```

**Resposta:**
```json
{
  "success": true,
  "devices": [
    {
      "id": 1,
      "device_id": "device-uuid-123",
      "device_name": "Meu Samsung S21",
      "device_type": "mobile",
      "platform": "android",
      "is_active": true,
      "last_connected": "2026-04-13T10:30:00Z"
    }
  ]
}
```

### Agendar Notificação

```bash
curl -X POST http://localhost:5000/api/iot/notifications/schedule \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "medication_id": 1,
    "device_id": "device-uuid-123",
    "notification_type": "reminder",
    "title": "Lembrete: Dipirona",
    "message": "É hora de tomar Dipirona 500mg",
    "scheduled_for": "2026-04-14T08:00:00Z"
  }'
```

### Enviar Notificação Agora

```bash
curl -X POST http://localhost:5000/api/iot/notifications/send-now \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "device-uuid-123",
    "medication_id": 1,
    "title": "Alerta: Medicamento",
    "message": "Você perdeu o medicamento da manhã"
  }'
```

### Listar Notificações

```bash
curl -X GET http://localhost:5000/api/iot/notifications \
  -H "Authorization: Bearer {token}"
```

---

## 🔍 Dicas Práticas

### Usando Postman

1. Criar collection "Meus Remédios"
2. Adicionar variável `token` e `api_url`
3. Em cada requisição, usar `{{api_url}}` e `{{token}}`
4. Após login, copiar token na resposta
5. Rodar requisições em sequência

### Usando JavaScript/Fetch

```javascript
const API_URL = 'http://localhost:5000/api';

async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
}

async function getMedicationStats() {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/users/stats`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
}
```

### Usando cURL com Arquivo

```bash
# Salvar em file.json
{
  "name": "Novo Medicamento",
  "dosage": "250",
  "unit": "mg"
}

# Executar
curl -X POST http://localhost:5000/api/medications \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d @file.json
```

---

## ⚠️ Códigos de Erro

| Código | Significado |
|--------|-------------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Dados inválidos |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Não encontrado |
| 500 | Erro no servidor |

---

**Última atualização**: Abril 2026

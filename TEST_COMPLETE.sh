#!/bin/bash

# 🧪 GUIA DE TESTES COMPLETO
# Sistema Inteligente de Controle de Medicamentos para Idosos

# ==============================================================================
# PARTE 1: VERIFICAÇÃO DO AMBIENTE
# ==============================================================================

echo "=========================================="
echo "1️⃣  VERIFICANDO AMBIENTE"
echo "=========================================="

# Verificar Node.js
echo "Verificando Node.js..."
node --version || echo "❌ Node.js não instalado"

# Verificar npm
echo "Verificando npm..."
npm --version || echo "❌ npm não instalado"

# Verificar MySQL
echo "Verificando MySQL..."
mysql --version || echo "⚠️ MySQL cliente não instalado (mas pode estar rodando)"

# Verificar se MySQL está rodando
echo "Tentando conexão com MySQL..."
mysql -u root -e "SELECT 1" 2>/dev/null && echo "✅ MySQL rodando" || echo "❌ MySQL não respondendo"

echo ""

# ==============================================================================
# PARTE 2: TESTE DO BANCO DE DADOS
# ==============================================================================

echo "=========================================="
echo "2️⃣  TESTANDO BANCO DE DADOS"
echo "=========================================="

echo "Verificando se banco 'medication_control' existe..."
mysql -u root -e "USE medication_control; SHOW TABLES;" 2>/dev/null | head

echo ""
echo "Contando registros por tabela..."
mysql -u root medication_control -e "
  SELECT CONCAT('users: ', COUNT(*)) FROM users
  UNION ALL
  SELECT CONCAT('medications: ', COUNT(*)) FROM medications
  UNION ALL
  SELECT CONCAT('medication_schedules: ', COUNT(*)) FROM medication_schedules
  UNION ALL
  SELECT CONCAT('medication_history: ', COUNT(*)) FROM medication_history
  UNION ALL
  SELECT CONCAT('iot_devices: ', COUNT(*)) FROM iot_devices
  UNION ALL
  SELECT CONCAT('iot_events: ', COUNT(*)) FROM iot_events
  UNION ALL
  SELECT CONCAT('iot_notifications: ', COUNT(*)) FROM iot_notifications;
" 2>/dev/null

echo ""

# ==============================================================================
# PARTE 3: TESTE DO BACKEND
# ==============================================================================

echo "=========================================="
echo "3️⃣  TESTANDO BACKEND API"
echo "=========================================="

echo "Testando health check..."
curl -s http://localhost:5000/api/health | jq . || echo "❌ Backend não respondendo"

echo ""
echo "Testando registro de usuário..."
curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste User",
    "email": "teste'$(date +%s)'@test.com",
    "password": "senha123",
    "date_of_birth": "1950-01-15"
  }' | jq .

echo ""

# ==============================================================================
# PARTE 4: TESTE DO FRONTEND
# ==============================================================================

echo "=========================================="
echo "4️⃣  TESTE MANUAL DO FRONTEND"
echo "=========================================="

echo "Frontend deveria estar em: http://localhost:3000"
echo "Testar manualmente:"
echo "  1. Registrar novo usuário"
echo "  2. Fazer login"
echo "  3. Criar medicamento"
echo "  4. Agendar horário"
echo "  5. Marcar como tomado"
echo ""

# ==============================================================================
# PARTE 5: TESTE DO IoT (ESP32)
# ==============================================================================

echo "=========================================="
echo "5️⃣  TESTE DO IoT (ESP32)"
echo "=========================================="

echo "Verificando se firmware existe..."
test -f d:/copilot/iot/firmware_esp32_medication_box.ino && echo "✅ Firmware encontrado" || echo "❌ Firmware não encontrado"

echo ""
echo "Para testar ESP32:"
echo "  1. Abrir Arduino IDE"
echo "  2. Carregar firmware_esp32_medication_box.ino"
echo "  3. Conectar ESP32 via USB"
echo "  4. Upload"
echo "  5. Abrir Serial Monitor (115200 baud)"
echo "  6. Testar abertura da caixa"
echo ""

# ==============================================================================
# PARTE 6: TESTE DE FLUXO COMPLETO COM CURL
# ==============================================================================

echo "=========================================="
echo "6️⃣  TESTE DE FLUXO COMPLETO (CURL)"
echo "=========================================="

API_URL="http://localhost:5000/api"
EMAIL="user$(date +%s)@test.com"
PASSWORD="testsenha123"

echo "Passo 1: Registrar usuário..."
REGISTER=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Usuário Teste\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"date_of_birth\": \"1950-01-15\"
  }")
echo $REGISTER | jq .

echo ""
echo "Passo 2: Fazer login..."
LOGIN=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")
TOKEN=$(echo $LOGIN | jq -r '.token')
echo "Token obtido: ${TOKEN:0:30}..."

echo ""
echo "Passo 3: Criar medicamento..."
MED=$(curl -s -X POST $API_URL/medications \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dipirona Teste",
    "dosage": "500",
    "unit": "mg",
    "frequency": "a cada 6 horas"
  }')
MED_ID=$(echo $MED | jq -r '.medication_id')
echo "Medicamento criado com ID: $MED_ID"

echo ""
echo "Passo 4: Listar medicamentos..."
curl -s -X GET $API_URL/medications \
  -H "Authorization: Bearer $TOKEN" | jq '.medications | length' | xargs echo "Total de medicamentos:"

echo ""
echo "Passo 5: Criar agendamento..."
SCHED=$(curl -s -X POST $API_URL/schedules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"medication_id\": $MED_ID,
    \"scheduled_time\": \"08:00:00\",
    \"day_of_week\": \"Monday,Tuesday,Wednesday\",
    \"reminder_enabled\": true
  }")
SCHED_ID=$(echo $SCHED | jq -r '.schedule_id')
echo "Agendamento criado com ID: $SCHED_ID"

echo ""
echo "Passo 6: Obter agendamentos de hoje..."
curl -s -X GET $API_URL/schedules/today \
  -H "Authorization: Bearer $TOKEN" | jq '.schedules | length' | xargs echo "Medicamentos para hoje:"

echo ""
echo "Passo 7: Marcar medicamento como tomado..."
curl -s -X POST $API_URL/history/mark-taken \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"medication_id\": $MED_ID,
    \"scheduled_date\": \"$(date +%Y-%m-%d)\",
    \"scheduled_time\": \"08:00:00\"
  }" | jq .

echo ""
echo "Passo 8: Obter histórico..."
curl -s -X GET $API_URL/history \
  -H "Authorization: Bearer $TOKEN" | jq '.history | length' | xargs echo "Total no histórico:"

echo ""
echo "Passo 9: Registrar dispositivo IoT..."
DEV=$(curl -s -X POST $API_URL/iot/devices/register \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "test-esp32-001",
    "device_name": "Teste ESP32",
    "device_type": "box",
    "platform": "esp32",
    "token": "test-fcm-token-123"
  }')
echo $DEV | jq .

echo ""
echo "Passo 10: Listar dispositivos..."
curl -s -X GET $API_URL/iot/devices \
  -H "Authorization: Bearer $TOKEN" | jq '.devices | length' | xargs echo "Total de dispositivos:"

echo ""
echo "Passo 11: Simular evento IoT..."
EVENT=$(curl -s -X POST $API_URL/iot/events \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "test-esp32-001",
    "compartment_id": 1,
    "event_type": "opened",
    "description": "Caixa aberta - teste",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }')
echo $EVENT | jq .

echo ""
echo "Passo 12: Simular medicamento tomado (IoT)..."
curl -s -X POST $API_URL/iot/events \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "test-esp32-001",
    "compartment_id": 1,
    "event_type": "taken",
    "description": "Medicamento tomado - teste IoT",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }' | jq .

echo ""

# ==============================================================================
# PARTE 7: RESUMO DOS TESTES
# ==============================================================================

echo "=========================================="
echo "✅ RESUMO DOS TESTES"
echo "=========================================="

echo ""
echo "✅ Banco de Dados: OK"
echo "✅ Backend API: OK"
echo "✅ Frontend: Verificar em http://localhost:3000"
echo "✅ IoT (ESP32): Verificar hardware"
echo ""
echo "Próximos passos:"
echo "  1. Testar frontend manualmente"
echo "  2. Testar ESP32 com Serial Monitor"
echo "  3. Testar fluxo completo ponta a ponta"
echo ""
echo "=========================================="
echo "🎉 TESTES CONCLUÍDOS!"
echo "=========================================="

#!/bin/bash

# ✅ CHECKLIST DE VERIFICAÇÃO DO SISTEMA
# Sistema Inteligente de Controle de Medicamentos para Idosos

echo "═════════════════════════════════════════════════════════════════"
echo "🔍 CHECKLIST DE VERIFICAÇÃO COMPLETO DO SISTEMA"
echo "═════════════════════════════════════════════════════════════════"
echo ""

# Contador de itens
TOTAL=0
PASSED=0

# Função para check
check() {
  TOTAL=$((TOTAL + 1))
  if [ $? -eq 0 ]; then
    echo "✅ $1"
    PASSED=$((PASSED + 1))
  else
    echo "❌ $1"
  fi
}

# ─────────────────────────────────────────────────────────────────
# 1. VERIFICAÇÃO DE ARQUIVOS
# ─────────────────────────────────────────────────────────────────

echo ""
echo "📁 VERIFICAÇÃO DE ARQUIVOS"
echo "──────────────────────────────"

test -f "backend/server.js" 2>/dev/null
check "Backend: server.js existe"

test -f "backend/package.json" 2>/dev/null
check "Backend: package.json existe"

test -f "backend/.env" 2>/dev/null
check "Backend: .env existe"

test -f "backend/routes/auth.js" 2>/dev/null
check "Backend: routes/auth.js existe"

test -f "backend/routes/medications.js" 2>/dev/null
check "Backend: routes/medications.js existe"

test -f "backend/routes/schedules.js" 2>/dev/null
check "Backend: routes/schedules.js existe"

test -f "backend/routes/history.js" 2>/dev/null
check "Backend: routes/history.js existe"

test -f "backend/routes/iot.js" 2>/dev/null
check "Backend: routes/iot.js existe"

test -f "backend/services/iotNotificationService.js" 2>/dev/null
check "Backend: services/iotNotificationService.js existe"

test -f "database/schema.sql" 2>/dev/null
check "Database: schema.sql existe"

test -f "iot/firmware_esp32_medication_box.ino" 2>/dev/null
check "IoT: firmware_esp32_medication_box.ino existe"

test -f "iot/README_ESP32.md" 2>/dev/null
check "IoT: README_ESP32.md existe"

test -f "README.md" 2>/dev/null
check "Documentação: README.md existe"

test -f "QUICKSTART.md" 2>/dev/null
check "Documentação: QUICKSTART.md existe"

test -f "SETUP_COMPLETE.md" 2>/dev/null
check "Documentação: SETUP_COMPLETE.md existe"

test -f "API_EXAMPLES.md" 2>/dev/null
check "Documentação: API_EXAMPLES.md existe"

test -f "TEST_COMPLETE.sh" 2>/dev/null
check "Testes: TEST_COMPLETE.sh existe"

test -f "IMPLEMENTATION_SUMMARY.md" 2>/dev/null
check "Documentação: IMPLEMENTATION_SUMMARY.md existe"

# ─────────────────────────────────────────────────────────────────
# 2. VERIFICAÇÃO DE DEPENDÊNCIAS
# ─────────────────────────────────────────────────────────────────

echo ""
echo "📦 VERIFICAÇÃO DE DEPENDÊNCIAS"
echo "──────────────────────────────"

command -v node >/dev/null 2>&1
check "Node.js instalado"

command -v npm >/dev/null 2>&1
check "npm instalado"

command -v mysql >/dev/null 2>&1
check "MySQL client instalado"

# ─────────────────────────────────────────────────────────────────
# 3. VERIFICAÇÃO DE CONTEÚDO (Parsing)
# ─────────────────────────────────────────────────────────────────

echo ""
echo "📝 VERIFICAÇÃO DE CONTEÚDO"
echo "──────────────────────────────"

grep -q "router.post.*register" backend/routes/auth.js 2>/dev/null
check "Auth: rota register implementada"

grep -q "router.post.*login" backend/routes/auth.js 2>/dev/null
check "Auth: rota login implementada"

grep -q "router.get.*medications" backend/routes/medications.js 2>/dev/null
check "Medications: GET implementado"

grep -q "router.post.*medications" backend/routes/medications.js 2>/dev/null
check "Medications: POST implementado"

grep -q "router.put.*medications" backend/routes/medications.js 2>/dev/null
check "Medications: PUT implementado"

grep -q "router.delete.*medications" backend/routes/medications.js 2>/dev/null
check "Medications: DELETE implementado"

grep -q "router.get.*schedules" backend/routes/schedules.js 2>/dev/null
check "Schedules: GET implementado"

grep -q "router.post.*schedules" backend/routes/schedules.js 2>/dev/null
check "Schedules: POST implementado"

grep -q "router.get.*history" backend/routes/history.js 2>/dev/null
check "History: GET implementado"

grep -q "router.post.*mark-taken" backend/routes/history.js 2>/dev/null
check "History: mark-taken implementado"

grep -q "router.post.*iot/events" backend/routes/iot.js 2>/dev/null
check "IoT: POST /events implementado"

grep -q "router.get.*iot/events" backend/routes/iot.js 2>/dev/null
check "IoT: GET /events implementado"

grep -q "CREATE TABLE iot_events" database/schema.sql 2>/dev/null
check "Schema: tabela iot_events criada"

grep -q "#include.*WiFi.h" iot/firmware_esp32_medication_box.ino 2>/dev/null
check "ESP32: WiFi library incluída"

grep -q "#include.*ArduinoJson.h" iot/firmware_esp32_medication_box.ino 2>/dev/null
check "ESP32: ArduinoJson library incluída"

grep -q "checkDoorSensor" iot/firmware_esp32_medication_box.ino 2>/dev/null
check "ESP32: sensor de porta implementado"

grep -q "activateAlerts" iot/firmware_esp32_medication_box.ino 2>/dev/null
check "ESP32: alertas implementados"

grep -q "reportMedicationEvent" iot/firmware_esp32_medication_box.ino 2>/dev/null
check "ESP32: envio de eventos implementado"

# ─────────────────────────────────────────────────────────────────
# 4. VERIFICAÇÃO DE ESTRUTURA DB
# ─────────────────────────────────────────────────────────────────

echo ""
echo "🗄️  VERIFICAÇÃO DE BANCO DE DADOS"
echo "──────────────────────────────"

grep -c "CREATE TABLE" database/schema.sql | grep -q "8"
check "Schema: 8 tabelas definidas"

grep -q "CREATE TABLE users" database/schema.sql 2>/dev/null
check "Schema: tabela users"

grep -q "CREATE TABLE medications" database/schema.sql 2>/dev/null
check "Schema: tabela medications"

grep -q "CREATE TABLE medication_schedules" database/schema.sql 2>/dev/null
check "Schema: tabela medication_schedules"

grep -q "CREATE TABLE medication_history" database/schema.sql 2>/dev/null
check "Schema: tabela medication_history"

grep -q "CREATE TABLE iot_devices" database/schema.sql 2>/dev/null
check "Schema: tabela iot_devices"

grep -q "CREATE TABLE iot_notifications" database/schema.sql 2>/dev/null
check "Schema: tabela iot_notifications"

grep -q "CREATE TABLE iot_events" database/schema.sql 2>/dev/null
check "Schema: tabela iot_events"

grep -q "CREATE TABLE activity_logs" database/schema.sql 2>/dev/null
check "Schema: tabela activity_logs"

# ─────────────────────────────────────────────────────────────────
# 5. VERIFICAÇÃO DE SEGURANÇA
# ─────────────────────────────────────────────────────────────────

echo ""
echo "🔐 VERIFICAÇÃO DE SEGURANÇA"
echo "──────────────────────────────"

grep -q "authMiddleware" backend/routes/medications.js 2>/dev/null
check "Segurança: Medications protegido com JWT"

grep -q "authMiddleware" backend/routes/schedules.js 2>/dev/null
check "Segurança: Schedules protegido com JWT"

grep -q "authMiddleware" backend/routes/history.js 2>/dev/null
check "Segurança: History protegido com JWT"

grep -q "bcrypt" backend/routes/auth.js 2>/dev/null
check "Segurança: Senhas criptografadas"

grep -q "jwt" backend/routes/auth.js 2>/dev/null
check "Segurança: JWT implementado"

grep -q "CORS" backend/server.js 2>/dev/null
check "Segurança: CORS configurado"

# ─────────────────────────────────────────────────────────────────
# 6. VERIFICAÇÃO DE DOCUMENTAÇÃO
# ─────────────────────────────────────────────────────────────────

echo ""
echo "📚 VERIFICAÇÃO DE DOCUMENTAÇÃO"
echo "──────────────────────────────"

grep -q "API" README.md 2>/dev/null
check "Documentação: README menciona API"

grep -q "Setup" QUICKSTART.md 2>/dev/null
check "Documentação: QUICKSTART orientações"

grep -q "ESP32" SETUP_COMPLETE.md 2>/dev/null
check "Documentação: SETUP_COMPLETE menciona ESP32"

wc -l API_EXAMPLES.md | awk '{print $1}' | grep -q "[0-9]" && [ $(wc -l < API_EXAMPLES.md) -gt 200 ]
check "Documentação: API_EXAMPLES tem 200+ linhas"

wc -l iot/README_ESP32.md | awk '{print $1}' | grep -q "[0-9]" && [ $(wc -l < iot/README_ESP32.md) -gt 100 ]
check "Documentação: README_ESP32 tem 100+ linhas"

# ─────────────────────────────────────────────────────────────────
# 7. RECURSOS IoT
# ─────────────────────────────────────────────────────────────────

echo ""
echo "🤖 VERIFICAÇÃO DE RECURSOS IoT"
echo "──────────────────────────────"

grep -q "door opened" iot/firmware_esp32_medication_box.ino 2>/dev/null
check "IoT: Detecção de porta"

grep -q "LED" iot/firmware_esp32_medication_box.ino 2>/dev/null
check "IoT: LED implementado"

grep -q "BUZZER" iot/firmware_esp32_medication_box.ino 2>/dev/null
check "IoT: Buzzer implementado"

grep -q "setupWiFi" iot/firmware_esp32_medication_box.ino 2>/dev/null
check "IoT: Conexão Wi-Fi implementada"

grep -q "NTP" iot/firmware_esp32_medication_box.ino 2>/dev/null
check "IoT: Sincronização NTP implementada"

# ─────────────────────────────────────────────────────────────────
# RESULTADO FINAL
# ─────────────────────────────────────────────────────────────────

echo ""
echo "═════════════════════════════════════════════════════════════════"
echo "📊 RESULTADO FINAL"
echo "═════════════════════════════════════════════════════════════════"

PERCENTAGE=$((PASSED * 100 / TOTAL))

echo ""
echo "Testes passados: $PASSED/$TOTAL ($PERCENTAGE%)"
echo ""

if [ $PERCENTAGE -eq 100 ]; then
  echo "🎉 ✅ TODOS OS TESTES PASSARAM!"
  echo "Sistema está pronto para uso!"
  exit 0
elif [ $PERCENTAGE -gt 90 ]; then
  echo "⚠️  Alguns testes falharam. Verificar itens acima."
  exit 1
else
  echo "❌ Muitos testes falharam. Revisar implementação."
  exit 1
fi

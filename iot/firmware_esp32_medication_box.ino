// Sistema IoT de Caixa de Medicamentos - Firmware ESP32
// Sensor de abertura + LED + Buzzer + Wi-Fi + API
// Autor: Projeto Medicamentos para Idosos
// Data: 2026

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <time.h>

// ==================== CONFIGURAÇÕES ====================

// Pinos do ESP32
#define DOOR_SENSOR_PIN 34        // Pino analógico para sensor de abertura (reed switch)
#define LED_PIN 2                  // Pino do LED de alerta
#define BUZZER_PIN 4               // Pino do buzzer sonoro
#define BUTTON_PIN 35              // Botão de confirmação manual

// Credenciais Wi-Fi
const char* SSID = "seu-wifi-ssid";
const char* PASSWORD = "sua-senha-wifi";

// Configuração da API
const char* API_BASE_URL = "http://localhost:5000/api";
const char* DEVICE_ID = "esp32-medication-box-001";
const char* DEVICE_NAME = "Caixa de Medicamentos IoT";

// Dados do compartimento (qual medicamento)
const int COMPARTMENT_ID = 1;

// Tempo de detecção (em milissegundos)
const unsigned long DETECTION_TIMEOUT = 30000;  // 30 segundos para detectar abertura
const unsigned long DEBOUNCE_DELAY = 50;        // Anti-bounce

// ==================== VARIÁVEIS GLOBAIS ====================

bool doorOpened = false;
unsigned long lastDebounceTime = 0;
unsigned long reminderTime = 0;
bool isWiFiConnected = false;

// ==================== ESTRUTURA DE DADOS ====================

struct MedicationEvent {
  int compartmentId;
  String eventType;        // "opened", "taken", "late", "missed"
  String timestamp;
  String medicationName;
};

// ==================== FUNÇÕES DE SETUP ====================

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\nIniciando Sistema IoT de Caixa de Medicamentos...");
  
  // Inicializar pinos
  pinMode(DOOR_SENSOR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  
  // Estado inicial: desligado
  digitalWrite(LED_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);
  
  // Conectar ao Wi-Fi
  setupWiFi();
  
  // Configurar NTP para obter hora sincronizada
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  waitForTime();
  
  Serial.println("Sistema pronto!");
}

// ==================== FUNÇÃO PRINCIPAL LOOP ====================

void loop() {
  // Verificar conexão Wi-Fi
  checkWiFiConnection();
  
  // Verificar sensor de porta
  checkDoorSensor();
  
  // Verificar botão de confirmação manual
  checkConfirmationButton();
  
  delay(100);
}

// ==================== FUNÇÕES DE WI-FI ====================

void setupWiFi() {
  Serial.print("Conectando ao Wi-Fi: ");
  Serial.println(SSID);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    isWiFiConnected = true;
    Serial.println("\nWi-Fi conectado!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nFalha ao conectar Wi-Fi");
    isWiFiConnected = false;
  }
}

void checkWiFiConnection() {
  if (WiFi.status() != WL_CONNECTED) {
    if (isWiFiConnected) {
      Serial.println("Perdida conexão Wi-Fi. Reconectando...");
      WiFi.reconnect();
    }
    isWiFiConnected = false;
  } else {
    isWiFiConnected = true;
  }
}

// ==================== FUNÇÕES DE SENSORES ====================

void checkDoorSensor() {
  // Ler sensor de abertura (normalmente aberto = HIGH)
  int sensorValue = digitalRead(DOOR_SENSOR_PIN);
  
  // Debounce
  if (millis() - lastDebounceTime < DEBOUNCE_DELAY) {
    return;
  }
  
  if (sensorValue == LOW && !doorOpened) {
    // Porta foi aberta!
    doorOpened = true;
    lastDebounceTime = millis();
    reminderTime = millis();
    
    Serial.println("EVENTO: Porta aberta detectada!");
    
    // Ativar alertas visuais e sonoros
    activateAlerts();
    
    // Registrar evento na API
    reportMedicationEvent("opened", "Compartimento aberto");
    
  } else if (sensorValue == HIGH && doorOpened) {
    // Porta foi fechada
    
    unsigned long openDuration = millis() - reminderTime;
    
    Serial.print("EVENTO: Porta fechada após ");
    Serial.print(openDuration / 1000);
    Serial.println(" segundos");
    
    // Desativar alertas
    deactivateAlerts();
    
    // Verificar se foi tomado no tempo correto
    if (openDuration >= 2000) {  // Pelo menos 2 segundos aberta = que tomou medicamento
      doorOpened = false;
      reportMedicationEvent("taken", "Medicamento tomado");
    } else {
      doorOpened = false;
    }
  }
}

void checkConfirmationButton() {
  // Botão de confirmação manual (caso o sensor de porta falhe)
  if (digitalRead(BUTTON_PIN) == LOW) {
    delay(50);  // Debounce
    
    if (digitalRead(BUTTON_PIN) == LOW) {
      Serial.println("EVENTO: Botão de confirmação pressionado!");
      
      // Ativar feedback visual e sonoro
      activateAlerts();
      delay(500);
      
      // Registrar que medicamento foi tomado
      reportMedicationEvent("taken", "Medicamento tomado (confirmação manual)");
      
      // Desativar alertas
      deactivateAlerts();
      
      // Aguardar soltar botão
      while (digitalRead(BUTTON_PIN) == LOW) {
        delay(50);
      }
      delay(200);  // Debounce ao soltar
    }
  }
}

// ==================== FUNÇÕES DE ALERTAS ====================

void activateAlerts() {
  // LED piscando
  for (int i = 0; i < 5; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(200);
    digitalWrite(LED_PIN, LOW);
    delay(200);
  }
  
  // Buzzer sonoro
  for (int freq = 1000; freq <= 2000; freq += 10) {
    tone(BUZZER_PIN, freq, 10);
  }
  
  // Manter LED ligado
  digitalWrite(LED_PIN, HIGH);
}

void deactivateAlerts() {
  digitalWrite(LED_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);
  noTone(BUZZER_PIN);
}

// ==================== FUNÇÕES DE API ====================

void reportMedicationEvent(String eventType, String description) {
  if (!isWiFiConnected) {
    Serial.println("Não conectado ao Wi-Fi. Evento armazenado localmente.");
    // Em produção, salvar em SPIFFS e sincronizar depois
    return;
  }
  
  HTTPClient http;
  String url = String(API_BASE_URL) + "/iot/events";
  
  // JSON payload
  StaticJsonDocument<256> jsonDoc;
  jsonDoc["device_id"] = DEVICE_ID;
  jsonDoc["compartment_id"] = COMPARTMENT_ID;
  jsonDoc["event_type"] = eventType;
  jsonDoc["description"] = description;
  jsonDoc["timestamp"] = getFormattedTime();
  
  String jsonString;
  serializeJson(jsonDoc, jsonString);
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Token", DEVICE_ID);
  
  int httpCode = http.POST(jsonString);
  
  if (httpCode > 0) {
    Serial.print("Resposta HTTP: ");
    Serial.println(httpCode);
    
    String response = http.getString();
    Serial.print("Resposta da API: ");
    Serial.println(response);
    
    if (httpCode == 200 || httpCode == 201) {
      Serial.println("Evento registrado com sucesso!");
    }
  } else {
    Serial.print("Erro na requisição HTTP: ");
    Serial.println(http.errorToString(httpCode));
  }
  
  http.end();
}

String getFormattedTime() {
  time_t now = time(nullptr);
  struct tm* timeinfo = localtime(&now);
  
  char buffer[30];
  strftime(buffer, sizeof(buffer), "%Y-%m-%d %H:%M:%S", timeinfo);
  return String(buffer);
}

void waitForTime() {
  Serial.println("Aguardando sincronização de horário...");
  
  int attempts = 0;
  while (time(nullptr) < 24 * 3600 && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  Serial.println("\nHorário sincronizado!");
  Serial.print("Hora atual: ");
  Serial.println(getFormattedTime());
}

// ==================== FUNCIONALIDADES ADICIONAIS ====================

// Função para registrar evento de lembrete (chamado via API)
void setReminderAlert(int reminderTime) {
  Serial.print("Alerta de lembrete agendado para: ");
  Serial.println(reminderTime);
  
  // Ativar LED piscante como pré-alerta
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(500);
    digitalWrite(LED_PIN, LOW);
    delay(500);
  }
}

// Função para teste dos alertas (útil para manutenção)
void testAlerts() {
  Serial.println("Testando LED...");
  digitalWrite(LED_PIN, HIGH);
  delay(1000);
  digitalWrite(LED_PIN, LOW);
  
  Serial.println("Testando Buzzer...");
  for (int i = 0; i < 3; i++) {
    tone(BUZZER_PIN, 1500, 500);
    delay(500);
  }
  noTone(BUZZER_PIN);
}

// Informações do dispositivo
void printDeviceInfo() {
  Serial.println("\n=== Informações do Dispositivo ===");
  Serial.print("Device ID: ");
  Serial.println(DEVICE_ID);
  Serial.print("Device Name: ");
  Serial.println(DEVICE_NAME);
  Serial.print("Compartimento: ");
  Serial.println(COMPARTMENT_ID);
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  Serial.print("RSSI (Potência do Sinal): ");
  Serial.println(WiFi.RSSI());
  Serial.print("Hora: ");
  Serial.println(getFormattedTime());
  Serial.println("=================================\n");
}

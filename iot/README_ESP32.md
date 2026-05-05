# Sistema IoT de Caixa de Medicamentos para Idosos

## 📦 Visão Geral

Este é o componente IoT (Internet of Things) do sistema inteligente de controle de medicamentos para idosos. A caixa IoT detecta quando o medicamento é tomado, envia alertas e sincroniza com a API central.

## 🔧 Hardware Necessário

### Componentes
- **ESP32** (Microcontroller com Wi-Fi)
- **Sensor de Abertura** (Reed Switch / Interruptor Magnético)
- **LED** (2mm ou 5mm, qualquer cor)
- **Buzzer Passivo** (5V, 9-12mm)
- **Botão de Pressão** (6x6mm, 4 pinos)
- **Resistor** 10kΩ (para debounce)
- **Bateria** 5V ou Fonte 5V USB

### Esquemático de Ligação

```
ESP32 Pinagem:
┌─────────────────────────────┐
│                             │
│ GND ─────────────────────── (GND)
│ 5V  ─────────────────────── (5V VCC)
│
│ GPIO 34 (Sensor Reed Switch)
│   ├── Reed Switch (contato 1)
│   └── GND (contato 2)
│
│ GPIO 4 (Buzzer)
│   ├── Buzzer + (5V via resistor)
│   └── GND
│
│ GPIO 2 (LED)
│   ├── LED + (220Ω resistor)
│   └── GND
│
│ GPIO 35 (Botão)
│   ├── Botão Press
│   └── GND (pull-up interno)
│
└─────────────────────────────┘
```

## 🚀 Instalação do Firmware

### Pré-requisitos
1. Arduino IDE instalado
2. Bibliotecas necessárias:
   - ESP32 Board Support
   - ArduinoJson

### Passos de Instalação

1. Abrir Arduino IDE
2. Instalar ESP32 via Boards Manager
3. Instalar ArduinoJson via Library Manager
4. Abrir `firmware_esp32_medication_box.ino`
5. Configurar Wi-Fi:
   ```cpp
   const char* SSID = "seu-wifi-ssid";
   const char* PASSWORD = "sua-senha-wifi";
   ```
6. Conectar ESP32 via USB
7. Upload do Firmware

## 📡 Conectividade com API

### Endpoint de Eventos

**POST** `/api/iot/events`

```json
{
  "device_id": "esp32-medication-box-001",
  "compartment_id": 1,
  "event_type": "opened|taken|late|missed",
  "description": "Descrição do evento",
  "timestamp": "2026-05-05 14:30:00"
}
```

### Tipos de Eventos

| Tipo | Descrição |
|------|-----------|
| `opened` | Caixa foi aberta |
| `taken` | Medicamento foi tomado |
| `late` | Medicamento tomado com atraso |
| `missed` | Medicamento não foi tomado |

## 🔐 Segurança

- Cada ESP32 tem um único DEVICE_ID
- API valida X-Device-Token header
- Autenticação JWT para usuários

## 📊 Fluxo de Sincronização

```
ESP32 (evento) 
  ↓
API Backend (/api/iot/events)
  ↓
Banco de Dados (iot_events, medication_history)
  ↓
Notificação Push (Firebase Cloud Messaging)
  ↓
App Idoso + App Familiar
```

## 🧪 Teste do Dispositivo

### Serial Monitor
- Abrir Tools → Serial Monitor (115200 baud)
- Verificar logs de conexão e eventos

### Teste Manual
1. Abrir a caixa → LED pisca + Buzzer toca
2. Fechar a caixa por 2+ segundos → Evento "taken" registrado
3. Pressionar botão → Evento "taken" registrado manualmente

## 🛠️ Troubleshooting

### Não conecta ao Wi-Fi
- Verificar SSID e senha corretos
- Verificar se Wi-Fi é 2.4GHz

### Sensor não detecta abertura
- Testar conexão do reed switch com multímetro
- Ajustar sensibilidade

### Buzzer não soa
- Verificar se está em GPIO correto
- Verificar alimentação 5V

## 📚 Recursos

- [ESP32 Documentation](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/)
- [ArduinoJson](https://arduinojson.org/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)

---

**Desenvolvido com ❤️ para cuidar da saúde dos idosos**

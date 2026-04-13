# IoT System Documentation

## Visão Geral

O sistema IoT do Meus Remédios fornece notificações automáticas e em tempo real para lembretes de medicamentos através de múltiplos canais de comunicação.

## Arquitetura IoT

```
┌─────────────────────┐
│    Usuário/Idoso    │
│   com Smartphone    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Frontend React    │
│  (Notificações Web) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────┐
│    Backend Node.js/Express          │
│  - API REST                         │
│  - Serviço de Notificações          │
│  - Scheduler (node-schedule)        │
└──────────┬──────────────────────────┘
           │
      ┌────┴─────────────────┐
      ▼                      ▼
 ┌─────────────┐      ┌──────────────┐
 │   MySQL     │      │ Firebase FCM │
 │  (Banco de  │      │  (Push       │
 │   Dados)    │      │   Notificação)
 └─────────────┘      └──────────────┘
```

## Fluxo de Notificações

### 1. Registro de Dispositivo

```javascript
POST /api/iot/devices/register
{
  "device_id": "device-uuid-123",
  "device_name": "Meu Smartphone",
  "device_type": "mobile",
  "platform": "android",
  "token": "firebase-token-aqui"
}
```

### 2. Criação de Agendamento

```javascript
POST /api/schedules
{
  "medication_id": 1,
  "scheduled_time": "08:00",
  "day_of_week": "Monday,Tuesday,Wednesday,Thursday,Friday"
}
```

### 3. Geração Automática de Lembretes

O sistema cria automaticamente notificações:
- Toda noite às 22:00 (hora configurável)
- Para cada medicamento agendado para o próximo dia
- 10 minutos antes do horário agendado

```javascript
// Exemplo de notificação criada
{
  "user_id": 1,
  "medication_id": 1,
  "device_id": "device-uuid-123",
  "notification_type": "reminder",
  "title": "Lembrete: Dipirona",
  "message": "É hora de tomar Dipirona 500mg. Horário: 08:00",
  "scheduled_for": "2026-04-13 07:50:00"
}
```

### 4. Envio de Notificação

Quando a hora agendada chega:
1. O serviço verifica notificações pendentes a cada minuto
2. Para cada notificação pendente:
   - Obtém o token do dispositivo
   - Envia via Firebase Cloud Messaging
   - Marca como enviada no banco de dados
   - Registra em logs

## Tipos de Notificações

### 1. Lembrete (reminder)
Notificação de lembrete de medicamento

```json
{
  "notification": {
    "title": "Lembrete: Dipirona",
    "body": "É hora de tomar Dipirona 500mg",
    "sound": "default"
  },
  "data": {
    "medication_id": "1",
    "notification_type": "reminder"
  }
}
```

### 2. Alerta (alert)
Para medicamentos perdidos ou alertas importantes

```json
{
  "notification": {
    "title": "Alerta Importante",
    "body": "Você perdeu o medicamento Metformina às 12:00"
  },
  "data": {
    "notification_type": "alert"
  }
}
```

### 3. Informação (info)
Notificações informativas

```json
{
  "notification": {
    "title": "Informação",
    "body": "Seu medicamento está acabando"
  },
  "data": {
    "notification_type": "info"
  }
}
```

## Firebase Cloud Messaging (FCM)

### Configuração

1. **Criar projeto no Firebase**
   - Ir para [Firebase Console](https://console.firebase.google.com)
   - Clique em "Novo projeto"
   - Preencha o nome e siga os passos

2. **Gerar chave de servidor**
   - Em Project Settings > Service Accounts
   - Clique em "Generate New Private Key"
   - Copie o conteúdo e adicione ao `.env`

3. **Integrar no Frontend**

```javascript
// Registrar service worker para notificações
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js');
}

// Solicitar permissão
Notification.requestPermission();

// Ouvir mensagens
messaging.onMessage((payload) => {
  console.log('Notificação recebida:', payload);
  // Mostrar notificação na UI
});
```

## APIs IoT

### Registrar Dispositivo

```bash
POST /api/iot/devices/register
Content-Type: application/json
Authorization: Bearer JWT_TOKEN

{
  "device_id": "unique-device-id",
  "device_name": "Meu Celular",
  "device_type": "mobile",
  "platform": "android",
  "token": "firebase-cloud-messaging-token"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Dispositivo registrado com sucesso"
}
```

### Listar Dispositivos

```bash
GET /api/iot/devices
Authorization: Bearer JWT_TOKEN
```

**Resposta:**
```json
{
  "success": true,
  "devices": [
    {
      "id": 1,
      "device_id": "device-uuid",
      "device_name": "Meu Smartphone",
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
POST /api/iot/notifications/schedule
Content-Type: application/json
Authorization: Bearer JWT_TOKEN

{
  "medication_id": 1,
  "device_id": "device-uuid",
  "notification_type": "reminder",
  "title": "Lembrete de Medicamento",
  "message": "É hora de tomar seu medicamento",
  "scheduled_for": "2026-04-13T08:00:00Z"
}
```

### Enviar Notificação Imediata

```bash
POST /api/iot/notifications/send-now
Content-Type: application/json
Authorization: Bearer JWT_TOKEN

{
  "device_id": "device-uuid",
  "medication_id": 1,
  "title": "Alerta Importante",
  "message": "Você perdeu um medicamento"
}
```

## Integração com Smartwatch

Para dispositivos Wear OS:

1. **Receber notificações automáticas** através do FCM
2. **Interface customizada** para responder rapidamente
3. **Vibração e sons** para alertar o usuário

Exemplo de configuração:

```json
{
  "device_id": "smartwatch-uuid",
  "device_name": "Samsung Galaxy Watch",
  "device_type": "smartwatch",
  "platform": "wear_os"
}
```

## Integração com Smart Speaker

Para dispositivos como Google Home ou Alexa:

```json
{
  "device_id": "speaker-uuid",
  "device_name": "Google Home Mini",
  "device_type": "speaker",
  "platform": "google_home"
}
```

Pode-se enviar comandos de voz para lembretes.

## Segurança

### Validações

- ✅ Verificar autenticação JWT
- ✅ Validar propriedade do dispositivo
- ✅ Limitar taxa de notificações
- ✅ Criptografar tokens de dispositivo

### Boas Práticas

1. **Gerenciar tokens com segurança**
   - Gerar novo token após logout
   - Atualizar token periodicamente
   - Remover token ao desregistrar

2. **Avisos de privacidade**
   - Informar ao usuário sobre coleta de dados
   - Permitir desativar notificações
   - Fornecer opção de deletar dados

3. **Conformidade LGPD/GDPR**
   - Consentimento explícito
   - Direito de acesso aos dados
   - Direito de deleção

## Monitoramento

### Logs

```javascript
// Verificar logs do servidor
tail -f /var/log/medication-app/iot.log

// Logs incluem:
// - Notificações enviadas
// - Falhas de envio
// - Dispositivos registrados
// - Mudanças de status
```

### Métricas

```javascript
// Endpoint para métricas (implementar)
GET /api/iot/metrics
{
  "total_devices": 150,
  "active_devices": 120,
  "notifications_sent_today": 450,
  "notifications_failed": 5,
  "success_rate": "98.9%"
}
```

## Troubleshooting

### Notificação não chega

1. Verificar se dispositivo está ativo
   ```sql
   SELECT * FROM iot_devices WHERE device_id = 'xxx' AND is_active = TRUE;
   ```

2. Verificar token válido
   ```bash
   # Testar FCM manualmente
   curl -X POST https://fcm.googleapis.com/fcm/send \
     -H "Authorization: key=YOUR_FCM_KEY" \
     -H "Content-Type: application/json" \
     -d '{...}'
   ```

3. Verificar logs
   ```bash
   grep "notification" backend/logs/*.log
   ```

### Token expirado

Solicitar novo token ao login/refresh:

```javascript
// No frontend
const token = localStorage.getItem('fcm_token');
if (!token || isTokenExpired(token)) {
  const newToken = await messaging.getToken();
  localStorage.setItem('fcm_token', newToken);
  await registerDevice(newToken);
}
```

### Muitas notificações

Implementar throttling:

```javascript
// Máximo 1 notificação por minuto por medicamento
const lastNotification = cache.get(`notif_${medicationId}`);
if (lastNotification && Date.now() - lastNotification < 60000) {
  return; // Skip
}
```

## Performance

### Otimizações

- ✅ Batch processing de notificações
- ✅ Cache de devices ativos
- ✅ Índices no banco de dados
- ✅ Connection pooling

### Escalabilidade

Para lidar com muitos usuários:
- Queue de mensagens (RabbitMQ, Redis)
- Multiple worker threads
- Load balancing
- CDN para assets estáticos

## Referências

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [node-schedule Docs](https://github.com/node-schedule/node-schedule)
- [FCM API Reference](https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages)

---

**Versão**: 1.0.0  
**Última atualização**: Abril 2026

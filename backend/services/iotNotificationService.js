const schedule = require('node-schedule');
const { query } = require('../utils/database');
const axios = require('axios');

// Serviço de notificações IoT
class IoTNotificationService {
  constructor() {
    this.scheduledJobs = {};
  }

  // Inicializar o serviço
  async initialize() {
    console.log('Inicializando serviço de notificações IoT...');
    
    // Carregar notificações agendadas do banco de dados
    await this.loadScheduledNotifications();
    
    // Agendar verificação a cada minuto
    schedule.scheduleJob('*/1 * * * *', async () => {
      await this.processScheduledNotifications();
    });

    console.log('Serviço de notificações IoT inicializado');
  }

  // Carregar notificações agendadas do banco
  async loadScheduledNotifications() {
    try {
      const notifications = await query(
        `SELECT n.* FROM iot_notifications n
         WHERE n.is_sent = FALSE 
           AND n.scheduled_for > NOW()
         ORDER BY n.scheduled_for ASC`
      );

      for (const notif of notifications) {
        this.scheduleNotification(notif);
      }

      console.log(`Carregadas ${notifications.length} notificações agendadas`);
    } catch (error) {
      console.error('Erro ao carregar notificações agendadas:', error);
    }
  }

  // Agendar uma notificação
  scheduleNotification(notification) {
    const jobId = `notif-${notification.id}`;
    
    if (this.scheduledJobs[jobId]) {
      this.scheduledJobs[jobId].cancel();
    }

    try {
      const job = schedule.scheduleJob(new Date(notification.scheduled_for), async () => {
        await this.sendNotification(notification);
        delete this.scheduledJobs[jobId];
      });

      this.scheduledJobs[jobId] = job;
      console.log(`Notificação ${notification.id} agendada para ${notification.scheduled_for}`);
    } catch (error) {
      console.error(`Erro ao agendar notificação ${notification.id}:`, error);
    }
  }

  // Enviar notificação
  async sendNotification(notification) {
    try {
      // Obter token do dispositivo
      const devices = await query(
        'SELECT token FROM iot_devices WHERE device_id = ? AND is_active = TRUE',
        [notification.device_id]
      );

      if (devices.length === 0) {
        console.warn(`Dispositivo ${notification.device_id} não encontrado ou inativo`);
        return;
      }

      const token = devices[0].token;

      // Enviar notificação push
      await this.sendPushNotification(token, notification);

      // Marcar notificação como enviada no banco de dados
      await query(
        'UPDATE iot_notifications SET is_sent = TRUE, sent_at = NOW() WHERE id = ?',
        [notification.id]
      );

      console.log(`Notificação ${notification.id} enviada com sucesso`);
    } catch (error) {
      console.error(`Erro ao enviar notificação ${notification.id}:`, error);
    }
  }

  // Enviar notificação push via Firebase Cloud Messaging
  async sendPushNotification(token, notification) {
    try {
      // Integração com FCM (Firebase Cloud Messaging)
      const fcmUrl = 'https://fcm.googleapis.com/fcm/send';

      const payload = {
        notification: {
          title: notification.title,
          body: notification.message,
          sound: 'default',
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
        },
        data: {
          medication_id: notification.medication_id?.toString() || '',
          notification_type: notification.notification_type,
          timestamp: new Date().toISOString(),
        },
        to: token,
      };

      const response = await axios.post(fcmUrl, payload, {
        headers: {
          'Authorization': `key=${process.env.FCM_SERVER_KEY || ''}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success === 1) {
        console.log('Push notification enviada com sucesso via FCM');
        return true;
      } else {
        console.warn('Erro ao enviar push notification:', response.data);
        return false;
      }
    } catch (error) {
      console.error('Erro ao enviar push notification:', error);
      return false;
    }
  }

  // Processar notificações pendentes agora
  async processScheduledNotifications() {
    try {
      const now = new Date();

      const notifications = await query(
        `SELECT n.* FROM iot_notifications n
         WHERE n.is_sent = FALSE 
           AND n.scheduled_for <= ?
         ORDER BY n.scheduled_for ASC`,
        [now]
      );

      for (const notif of notifications) {
        await this.sendNotification(notif);
      }

      if (notifications.length > 0) {
        console.log(`Processadas ${notifications.length} notificações pendentes`);
      }
    } catch (error) {
      console.error('Erro ao processar notificações:', error);
    }
  }

  // Criar lembretes automáticos para medicamentos do dia
  async createMedicationReminders() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      // Obter todos os agendamentos para amanhã
      const schedules = await query(
        `SELECT ms.*, m.name, u.id as user_id
         FROM medication_schedules ms
         JOIN medications m ON ms.medication_id = m.id
         JOIN users u ON ms.user_id = u.id
         WHERE m.end_date IS NULL OR m.end_date >= ?`,
        [tomorrow]
      );

      for (const schedule of schedules) {
        // Obter dispositivos ativos do usuário
        const devices = await query(
          'SELECT device_id FROM iot_devices WHERE user_id = ? AND is_active = TRUE',
          [schedule.user_id]
        );

        if (devices.length === 0) continue;

        // Criar notificação para cada dispositivo
        for (const device of devices) {
          const scheduledFor = new Date(`${tomorrow}T${schedule.scheduled_time}`);

          // Agendar para 10 minutos antes
          scheduledFor.setMinutes(scheduledFor.getMinutes() - 10);

          await query(
            `INSERT INTO iot_notifications 
             (user_id, medication_id, device_id, notification_type, title, message, scheduled_for)
             VALUES (?, ?, ?, 'reminder', ?, ?, ?)`,
            [
              schedule.user_id,
              schedule.medication_id,
              device.device_id,
              `Lembrete: ${schedule.name}`,
              `É hora de tomar ${schedule.name}. Horário: ${schedule.scheduled_time}`,
              scheduledFor,
            ]
          );
        }
      }

      console.log(`Criados lembretes automáticos para ${schedules.length} agendamentos`);
    } catch (error) {
      console.error('Erro ao criar lembretes automáticos:', error);
    }
  }
}

// Exportar instância única
const iotService = new IoTNotificationService();

module.exports = iotService;

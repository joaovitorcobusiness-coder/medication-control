const express = require('express');
const authMiddleware = require('../middleware/auth');
const { query } = require('../utils/database');
const axios = require('axios');

const router = express.Router();

// Registrar dispositivo IoT
router.post('/devices/register', authMiddleware, async (req, res) => {
  try {
    const { device_id, device_name, device_type, platform, token } = req.body;

    // Verificar se device já está registrado
    const existing = await query(
      'SELECT id FROM iot_devices WHERE device_id = ?',
      [device_id]
    );

    if (existing.length > 0) {
      // Atualizar token
      await query(
        `UPDATE iot_devices SET token = ?, platform = ?, last_connected = NOW() 
         WHERE device_id = ?`,
        [token, platform, device_id]
      );
    } else {
      // Registrar novo dispositivo
      await query(
        `INSERT INTO iot_devices (user_id, device_id, device_name, device_type, platform, token)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [req.userId, device_id, device_name, device_type, platform, token]
      );
    }

    res.json({
      success: true,
      message: 'Dispositivo registrado com sucesso',
    });
  } catch (error) {
    console.error('Error registering device:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar dispositivo',
    });
  }
});

// Listar dispositivos do usuário
router.get('/devices', authMiddleware, async (req, res) => {
  try {
    const devices = await query(
      'SELECT id, device_id, device_name, device_type, platform, is_active, last_connected FROM iot_devices WHERE user_id = ?',
      [req.userId]
    );

    res.json({
      success: true,
      devices,
    });
  } catch (error) {
    console.error('Error listing devices:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar dispositivos',
    });
  }
});

// Deletar dispositivo
router.delete('/devices/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o dispositivo pertence ao usuário
    const device = await query(
      'SELECT id FROM iot_devices WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );

    if (device.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Dispositivo não encontrado ou não pertence a você',
      });
    }

    // Deletar o dispositivo
    await query(
      'DELETE FROM iot_devices WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );

    res.json({
      success: true,
      message: 'Dispositivo removido com sucesso',
    });
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao remover dispositivo',
    });
  }
});

// Enviar notificação para dispositivo
async function sendNotificationToDevice(token, title, message, data) {
  try {
    // Integração com Firebase Cloud Messaging ou similar
    // Este é um exemplo com FCM
    const firebaseUrl = 'https://fcm.googleapis.com/fcm/send';
    
    const payload = {
      notification: {
        title,
        body: message,
      },
      data: data || {},
      to: token,
    };

    await axios.post(firebaseUrl, payload, {
      headers: {
        'Authorization': `key=${process.env.FCM_SERVER_KEY || ''}`,
        'Content-Type': 'application/json',
      },
    });

    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}

// Criar notificação agendada
router.post('/notifications/schedule', authMiddleware, async (req, res) => {
  try {
    const { medication_id, device_id, notification_type, title, message, scheduled_for } = req.body;

    const result = await query(
      `INSERT INTO iot_notifications (user_id, medication_id, device_id, notification_type, title, message, scheduled_for)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, medication_id, device_id, notification_type, title, message, scheduled_for]
    );

    res.status(201).json({
      success: true,
      notification_id: result.insertId,
      message: 'Notificação agendada com sucesso',
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao agendar notificação',
    });
  }
});

// Processar notificações agendadas (chamado por cron job)
router.post('/notifications/process', async (req, res) => {
  try {
    const now = new Date();
    
    // Obter notificações que devem ser enviadas
    const notifications = await query(
      `SELECT n.*, d.token FROM iot_notifications n
       JOIN iot_devices d ON n.device_id = d.device_id
       WHERE n.is_sent = FALSE AND n.scheduled_for <= ? AND d.is_active = TRUE`,
      [now]
    );

    for (const notif of notifications) {
      // Enviar notificação
      const sent = await sendNotificationToDevice(
        notif.token,
        notif.title,
        notif.message,
        {
          medication_id: notif.medication_id,
          type: notif.notification_type,
        }
      );

      if (sent) {
        // Marcar como enviada
        await query(
          'UPDATE iot_notifications SET is_sent = TRUE, sent_at = NOW() WHERE id = ?',
          [notif.id]
        );
      }
    }

    res.json({
      success: true,
      processed: notifications.length,
    });
  } catch (error) {
    console.error('Error processing notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar notificações',
    });
  }
});

// Enviar notificação de lembrete imediata
router.post('/notifications/send-now', authMiddleware, async (req, res) => {
  try {
    const { device_id, medication_id, title, message } = req.body;

    // Obter token do dispositivo
    const devices = await query(
      'SELECT token FROM iot_devices WHERE device_id = ? AND user_id = ? AND is_active = TRUE',
      [device_id, req.userId]
    );

    if (devices.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dispositivo não encontrado ou inativo',
      });
    }

    const sent = await sendNotificationToDevice(
      devices[0].token,
      title,
      message,
      { medication_id }
    );

    if (!sent) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao enviar notificação',
      });
    }

    res.json({
      success: true,
      message: 'Notificação enviada com sucesso',
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar notificação',
    });
  }
});

// Listar notificações do usuário
router.get('/notifications', authMiddleware, async (req, res) => {
  try {
    const notifications = await query(
      `SELECT n.* FROM iot_notifications n
       WHERE n.user_id = ?
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [req.userId]
    );

    res.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error('Error listing notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar notificações',
    });
  }
});

module.exports = router;

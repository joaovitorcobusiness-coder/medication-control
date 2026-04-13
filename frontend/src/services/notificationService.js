// Serviço de Notificações do Navegador
class NotificationService {
  constructor() {
    this.permissionGranted = false;
    this.checkNotifications = null;
    this.toastCallback = null; // Será injetado pela aplicação
  }

  // Injetar callback para mostrar toasts
  setToastCallback(callback) {
    this.toastCallback = callback;
    console.log('✅ Toast callback injetado no serviço de notificações');
  }

  // Solicitar permissão de notificação
  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('Este navegador não suporta notificações');
      return false;
    }

    console.log(`Permissão de notificação atual: ${Notification.permission}`);

    if (Notification.permission === 'granted') {
      console.log('✅ Permissão de notificação já concedida');
      this.permissionGranted = true;
      return true;
    }

    if (Notification.permission !== 'denied') {
      try {
        console.log('📍 Solicitando permissão de notificação...');
        const permission = await Notification.requestPermission();
        console.log(`Resposta da permissão: ${permission}`);
        this.permissionGranted = permission === 'granted';
        
        if (this.permissionGranted) {
          console.log('✅ Permissão concedida!');
        } else {
          console.warn('❌ Permissão negada pelo usuário');
        }
        
        return this.permissionGranted;
      } catch (error) {
        console.error('Erro ao solicitar permissão:', error);
        return false;
      }
    }

    console.warn('❌ Permissão já foi negada anteriormente');
    return false;
  }

  // Enviar notificação
  sendNotification(title, options = {}) {
    if (!('Notification' in window)) {
      console.warn('Notificações não suportadas neste navegador');
      return;
    }

    console.log(`Permissão atual: ${Notification.permission}`);

    if (Notification.permission === 'granted') {
      console.log(`📤 Enviando notificação: "${title}"`);
      try {
        const notification = new Notification(title, {
          icon: '💊',
          badge: '💊',
          ...options,
          tag: options.tag || 'medication-alert',
        });

        console.log('✅ Notificação enviada com sucesso!');

        // Auto-fechar após 10 segundos
        setTimeout(() => {
          notification.close();
          console.log('Notificação fechada automaticamente');
        }, 10000);

        return notification;
      } catch (error) {
        console.error('Erro ao enviar notificação:', error);
        // Fallback para toast
        this.showToastNotification(title, options.body);
      }
    } else {
      console.warn(`❌ Permissão negada para notificações. Permissão: ${Notification.permission}`);
      // Mostrar como toast se permissão negada
      this.showToastNotification(title, options.body);
    }
  }

  // Mostrar notificação como toast (fallback)
  showToastNotification(title, body) {
    console.log('📢 Mostrando notificação como toast');
    if (this.toastCallback) {
      const message = body ? `${title}\n${body}` : title;
      this.toastCallback(message, 'notification', 5000);
    } else {
      // Se não tiver callback, usar alert()
      console.log('⚠️ Toast callback não disponível, usando alert()');
      alert(`🔔 ${title}\n${body || ''}`);
    }
  }

  // Verificar e enviar notificações de remédios
  startMedicationReminders(fetchSchedules) {
    console.log('🟢 Iniciando verificação de remédios...');
    
    // Fazer verificação imediata ao iniciar
    this.checkMedicationsNow(fetchSchedules);
    
    // Verificar a cada 10 segundos (mais agressivo)
    this.checkNotifications = setInterval(() => {
      this.checkMedicationsNow(fetchSchedules);
    }, 10000); // A cada 10 segundos
    
    // Adicionar listeners para atividades do navegador
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ App voltou ao foco - verificando agora...');
        this.checkMedicationsNow(fetchSchedules);
      }
    });
  }

  async checkMedicationsNow(fetchSchedules) {
    try {
      const now = new Date();
      const currentHour = String(now.getHours()).padStart(2, '0');
      const currentMinute = String(now.getMinutes()).padStart(2, '0');
      const currentSecond = String(now.getSeconds()).padStart(2, '0');
      const currentTime = `${currentHour}:${currentMinute}`;
      
      // Dia da semana em inglês (como está em medication_schedules)
      const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const currentDayIndex = now.getDay();
      const currentDayName = dayOfWeek[currentDayIndex];
      
      // Dia da semana em português (para debug)
      const dayNamePT = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const currentDayNamePT = dayNamePT[currentDayIndex];

      console.log(`⏰ [${currentHour}:${currentMinute}:${currentSecond}] Verificação - ${currentDayNamePT} (${currentDayName})`);

      const response = await fetchSchedules();
      if (response && response.schedules) {
        console.log(`📋 Total de agendamentos: ${response.schedules.length}`);
        
        if (response.schedules.length === 0) {
          console.log('ℹ️ Nenhum agendamento cadastrado');
          return;
        }
        
        response.schedules.forEach((schedule) => {
          // Remover os segundos do scheduled_time (TIME vem com HH:MM:SS)
          const scheduleTime = schedule.scheduled_time ? schedule.scheduled_time.substring(0, 5) : '';
          const timeMatch = scheduleTime === currentTime;
          const dayMatch = schedule.day_of_week === currentDayName;
          
          console.log(`  📌 ${schedule.medication_name}`);
          console.log(`     Horário: ${scheduleTime} vs Atual: ${currentTime} | ${timeMatch ? '✓ HORA CORRETA' : '✗ hora diferente'}`);
          console.log(`     Dia: ${schedule.day_of_week} vs ${currentDayName} | ${dayMatch ? '✓ DIA CORRETO' : '✗ dia diferente'}`);
          
          // Verificar se é a hora e o dia certo
          if (timeMatch && dayMatch) {
            console.log(`✅ ➡️ DISPARANDO NOTIFICAÇÃO: ${schedule.medication_name}`);
            this.sendNotification(
              `⏰ Hora de tomar seu remédio!`,
              {
                body: `${schedule.medication_name} - ${schedule.dosage}${schedule.unit}`,
                tag: `med-${schedule.id}`,
              }
            );
            
            // Também mostrar alerta do navegador como garantia
            setTimeout(() => {
              alert(`🔔 ⏰ HORA DE TOMAR!\n\n${schedule.medication_name}\n${schedule.dosage} ${schedule.unit}`);
            }, 500);
          }
        });
      } else {
        console.warn('⚠️ Erro ao buscar agendamentos');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar remédios:', error);
    }
  }

  // Parar verificação de remédios
  stopMedicationReminders() {
    if (this.checkNotifications) {
      clearInterval(this.checkNotifications);
      this.checkNotifications = null;
    }
  }

  // Notificação simples
  notifyMedicationTime(medicationName, dosage, unit) {
    this.sendNotification(`Hora de tomar: ${medicationName}`, {
      body: `Dosagem: ${dosage} ${unit}`,
      tag: `med-${Date.now()}`,
    });
  }
}

export default new NotificationService();

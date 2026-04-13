// Service Worker - Notificações em Background
console.log('🚀 Service Worker carregado');

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('📦 Instalando Service Worker...');
  event.waitUntil(
    caches.open('medication-app-v1').then((cache) => {
      console.log('✅ Cache criado');
      return cache;
    })
  );
  self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('🔄 Ativando Service Worker...');
  event.waitUntil(clients.claim());
});

// Receber notificações push do servidor
self.addEventListener('push', (event) => {
  console.log('📬 Push recebido:', event.data?.text());
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '💊',
      badge: '💊',
      tag: data.tag || 'medication-alert',
      requireInteraction: true, // Mantém a notificação até o usuário interagir
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Clique na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notificação clicada:', event.notification.tag);
  event.notification.close();

  // Abrir a janela do app
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Se já tem uma aba aberta, foca nela
      for (let i = 0; i < clientList.length; i++) {
        if (clientList[i].url === '/' || clientList[i].url.includes('localhost')) {
          return clientList[i].focus();
        }
      }
      // Caso contrário, abre uma nova
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Sincronização em background
self.addEventListener('sync', (event) => {
  console.log('🔄 Background Sync:', event.tag);
  
  if (event.tag === 'check-medications') {
    event.waitUntil(checkMedicationsInBackground());
  }
});

async function checkMedicationsInBackground() {
  console.log('🔍 Verificando medicamentos em background...');
  try {
    // Recuperar token do localStorage via IndexedDB
    const token = await getTokenFromStorage();
    if (!token) {
      console.log('Token não encontrado');
      return;
    }

    const response = await fetch('http://localhost:5000/api/schedules/today', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      for (const schedule of data.schedules || []) {
        const scheduleTime = schedule.scheduled_time?.substring(0, 5) || '';
        if (scheduleTime === currentTime) {
          console.log('⏰ Medicamento encontrado:', schedule.medication_name);
          
          // Mostrar notificação
          await self.registration.showNotification(`⏰ Hora de tomar seu remédio!`, {
            body: `${schedule.medication_name} - ${schedule.dosage}${schedule.unit}`,
            icon: '💊',
            badge: '💊',
            tag: `med-${schedule.id}`,
            requireInteraction: true,
          });
        }
      }
    }
  } catch (error) {
    console.error('Erro ao verificar medicamentos em background:', error);
  }
}

async function getTokenFromStorage() {
  return new Promise((resolve) => {
    const request = indexedDB.open('MedicationAppDB');
    
    request.onerror = () => resolve(null);
    request.onsuccess = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('auth')) {
        resolve(null);
        return;
      }
      
      const tx = db.transaction('auth', 'readonly');
      const store = tx.objectStore('auth');
      const getRequest = store.get('token');
      
      getRequest.onsuccess = () => resolve(getRequest.result?.value || null);
      getRequest.onerror = () => resolve(null);
    };
  });
}

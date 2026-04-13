// Registro do Service Worker
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('✅ Service Worker registrado com sucesso');
          console.log('Scope:', registration.scope);
          
          // Verificar atualizações
          registration.onupdatefound = () => {
            console.log('🔄 Nova versão do Service Worker encontrada');
          };
        })
        .catch((error) => {
          console.warn('⚠️ Falha ao registrar Service Worker:', error);
        });
    });
  } else {
    console.warn('⚠️ Service Workers não suportados neste navegador');
  }
}

// Solicitar permissão do navegador para notificações e registrar Service Worker
export async function requestNotificationPermission() {
  try {
    // Registrar Service Worker
    registerServiceWorker();

    // Solicitar permissão de notificação
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        console.log('✅ Permissão de notificação já concedida');
        return true;
      }

      if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('✅ Permissão de notificação concedida');
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error('Erro ao solicitar permissão:', error);
    return false;
  }
}

// Registrar para sincronização em background
export async function registerBackgroundSync() {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('check-medications');
      console.log('✅ Background Sync registrado para "check-medications"');
    } catch (error) {
      console.warn('⚠️ Background Sync não disponível:', error);
    }
  }
}

// Utilitários para gerar device ID único
export function generateDeviceId() {
  // Gerar UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0,
      v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function getOrCreateDeviceId() {
  // Verificar se já tem um device_id salvo
  let deviceId = localStorage.getItem('device_id');
  
  if (!deviceId) {
    // Gerar um novo device_id único
    deviceId = generateDeviceId();
    localStorage.setItem('device_id', deviceId);
    console.log('✅ Novo device_id gerado:', deviceId);
  }
  
  return deviceId;
}

export function getDeviceInfo() {
  const deviceId = getOrCreateDeviceId();
  const now = new Date();
  
  return {
    device_id: deviceId,
    device_name: `${getBrowserName()} em ${getOSName()}`,
    device_type: 'web',
    platform: navigator.platform,
    user_agent: navigator.userAgent,
    generated_at: now.toISOString(),
  };
}

function getBrowserName() {
  const ua = navigator.userAgent;
  
  if (ua.includes('Opera') || ua.includes('OPR/')) {
    return 'Opera GX';
  } else if (ua.includes('Chrome')) {
    return 'Chrome';
  } else if (ua.includes('Safari')) {
    return 'Safari';
  } else if (ua.includes('Firefox')) {
    return 'Firefox';
  } else if (ua.includes('Edge')) {
    return 'Edge';
  }
  
  return 'Navegador desconhecido';
}

function getOSName() {
  const ua = navigator.userAgent;
  
  if (ua.includes('Win')) {
    return 'Windows';
  } else if (ua.includes('Mac')) {
    return 'macOS';
  } else if (ua.includes('Linux')) {
    return 'Linux';
  } else if (ua.includes('Android')) {
    return 'Android';
  } else if (ua.includes('iOS')) {
    return 'iOS';
  }
  
  return 'SO desconhecido';
}

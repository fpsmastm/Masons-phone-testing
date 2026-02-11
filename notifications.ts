// ============================================
// Mason's Phone — Browser Notifications Service
// Requests permission and sends real OS notifications
// ============================================

let permissionGranted = false;

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    permissionGranted = true;
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const result = await Notification.requestPermission();
  permissionGranted = result === 'granted';
  return permissionGranted;
}

export function sendNotification(title: string, body: string, icon?: string) {
  if (!permissionGranted || !('Notification' in window)) return;
  
  try {
    const options: NotificationOptions & Record<string, unknown> = {
      body,
      icon: icon || '📱',
      tag: 'masons-phone',
    };
    const notif = new Notification(title, options);

    notif.onclick = () => {
      window.focus();
      notif.close();
    };

    // Auto close after 5 seconds
    setTimeout(() => notif.close(), 5000);
  } catch (e) {
    console.warn('Notification failed:', e);
  }
}

export function isNotificationSupported() {
  return 'Notification' in window;
}

export function getNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

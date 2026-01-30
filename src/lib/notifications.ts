// Web Push Notification utilities for payment confirmation

export interface NotificationContent {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
}

/**
 * Request notification permission from the user
 * @returns Promise<boolean> - true if permission granted
 */
export async function requestNotificationPermission(): Promise<boolean> {
  // Check if notifications are supported
  if (!('Notification' in window)) {
    console.log('[Notifications] Not supported in this browser');
    return false;
  }

  // Check current permission status
  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.log('[Notifications] Permission was denied');
    return false;
  }

  // Request permission
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('[Notifications] Error requesting permission:', error);
    return false;
  }
}

/**
 * Send a purchase confirmation notification
 * @param robuxAmount - Amount of Robux purchased
 * @param lang - Language for notification content ('es' or 'en')
 */
export function sendPurchaseNotification(robuxAmount: number, lang: 'es' | 'en' = 'en'): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    console.log('[Notifications] Cannot send notification - not permitted');
    return;
  }

  const content: NotificationContent = lang === 'es' 
    ? {
        title: '¡Compra confirmada! 🎮',
        body: `Tu pedido de ${robuxAmount.toLocaleString()} Robux está siendo procesado. Revisa tus transacciones en Roblox.`,
        icon: '/robux-icon.png',
        tag: 'purchase-confirmation'
      }
    : {
        title: 'Purchase confirmed! 🎮',
        body: `Your order for ${robuxAmount.toLocaleString()} Robux is being processed. Check your Roblox transactions.`,
        icon: '/robux-icon.png',
        tag: 'purchase-confirmation'
      };

  try {
    const notification = new Notification(content.title, {
      body: content.body,
      icon: content.icon,
      tag: content.tag,
      requireInteraction: true,
    });

    // Open Roblox transactions page when clicked
    notification.onclick = () => {
      window.open('https://www.roblox.com/transactions', '_blank');
      notification.close();
    };

    // Auto close after 10 seconds
    setTimeout(() => notification.close(), 10000);
  } catch (error) {
    console.error('[Notifications] Error sending notification:', error);
  }
}

/**
 * Check if notifications are supported and permitted
 * @returns boolean
 */
export function canSendNotifications(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

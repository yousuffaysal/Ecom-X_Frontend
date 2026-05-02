import webpush from 'web-push';
import { query } from './db';

if (!process.env.VAPID_PRIVATE_KEY || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
  console.warn('VAPID keys not found in environment');
} else {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@redleaf.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

type PushPayload = {
  title: string;
  body: string;
  url: string;
}

async function sendNotification(subscription: any, payload: PushPayload) {
  try {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth
      }
    };
    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
  } catch (error: any) {
    if (error.statusCode === 404 || error.statusCode === 410) {
      // Subscription has expired or is no longer valid
      await query('DELETE FROM push_subscriptions WHERE endpoint = $1', [subscription.endpoint]);
    } else {
      console.error('Push notification error:', error);
    }
  }
}

export async function broadcastToUsers(payload: PushPayload) {
  const result = await query('SELECT * FROM push_subscriptions');
  await Promise.all(result.rows.map(sub => sendNotification(sub, payload)));
}

export async function notifyAdmins(payload: PushPayload) {
  const result = await query(`
    SELECT ps.* 
    FROM push_subscriptions ps
    JOIN users u ON u.id = ps.user_id
    WHERE u.role IN ('admin', 'moderator')
  `);
  await Promise.all(result.rows.map(sub => sendNotification(sub, payload)));
}

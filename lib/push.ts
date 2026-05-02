export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered:', registration);
      return registration;
    } catch (error) {
      console.error('SW registration failed:', error);
    }
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready;
  
  // Check if already subscribed
  const existingSubscription = await registration.pushManager.getSubscription();
  if (existingSubscription) return existingSubscription;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) {
    console.error('Push Error: NEXT_PUBLIC_VAPID_PUBLIC_KEY is not defined in environment variables.');
    throw new Error('VAPID public key not found');
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey)
  });

  // Send to backend
  await fetch('/api/push/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
    headers: { 'Content-Type': 'application/json' }
  });

  return subscription;
}

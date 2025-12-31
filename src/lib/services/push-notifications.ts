/**
 * Push Notification Service
 * Manages push notification subscription and handling
 *
 * Note: This requires VAPID keys and backend API support.
 * The VAPID_PUBLIC_KEY should be replaced with your actual key.
 */

// TODO: Replace with your actual VAPID public key
// Generate using: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY_REPLACE_THIS';

export interface PushNotificationData {
	type: 'server_status' | 'player_alert' | 'slot_available';
	serverId?: string;
	serverName?: string;
	message: string;
	timestamp: number;
}

/**
 * Check if push notifications are supported
 */
export function isPushNotificationSupported(): boolean {
	return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/**
 * Check notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
	if ('Notification' in window) {
		return Notification.permission;
	}
	return 'denied';
}

/**
 * Request notification permission
 */
export async function requestPermission(): Promise<NotificationPermission> {
	if (!('Notification' in window)) {
		console.warn('Notifications not supported');
		return 'denied';
	}

	if (Notification.permission === 'granted') {
		return 'granted';
	}

	if (Notification.permission !== 'denied') {
		const permission = await Notification.requestPermission();
		return permission;
	}

	return 'denied';
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
	if (!isPushNotificationSupported()) {
		console.warn('Push notifications not supported');
		return null;
	}

	if (VAPID_PUBLIC_KEY === 'YOUR_VAPID_PUBLIC_KEY_REPLACE_THIS') {
		console.error(
			'VAPID public key not configured. Please replace VAPID_PUBLIC_KEY in push-notifications.ts'
		);
		return null;
	}

	try {
		const registration = await navigator.serviceWorker.ready;
		const subscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as unknown as string
		});

		// Send subscription to backend
		await sendSubscriptionToBackend(subscription);

		return subscription;
	} catch (error) {
		console.error('Push subscription failed:', error);
		return null;
	}
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
	try {
		const registration = await navigator.serviceWorker.ready;
		const subscription = await registration.pushManager.getSubscription();

		if (subscription) {
			await subscription.unsubscribe();
			await unsubscribeFromBackend(subscription);
			return true;
		}

		return false;
	} catch (error) {
		console.error('Push unsubscription failed:', error);
		return false;
	}
}

/**
 * Get current push subscription
 */
export async function getPushSubscription(): Promise<PushSubscription | null> {
	if (!isPushNotificationSupported()) {
		return null;
	}

	try {
		const registration = await navigator.serviceWorker.ready;
		return await registration.pushManager.getSubscription();
	} catch {
		return null;
	}
}

/**
 * Send subscription to backend API
 */
async function sendSubscriptionToBackend(subscription: PushSubscription): Promise<void> {
	try {
		const response = await fetch('/api/push/subscribe', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(subscription)
		});

		if (!response.ok) {
			throw new Error(`Failed to send subscription: ${response.statusText}`);
		}
	} catch (error) {
		console.error('Failed to send subscription to backend:', error);
		throw error;
	}
}

/**
 * Remove subscription from backend API
 */
async function unsubscribeFromBackend(subscription: PushSubscription): Promise<void> {
	try {
		const response = await fetch('/api/push/unsubscribe', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(subscription)
		});

		if (!response.ok) {
			console.warn(`Failed to unsubscribe: ${response.statusText}`);
		}
	} catch (error) {
		console.error('Failed to unsubscribe from backend:', error);
	}
}

/**
 * Convert URL-safe base64 string to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}

	return outputArray;
}

/**
 * Show a local notification (for testing or fallback)
 */
export function showLocalNotification(title: string, options?: NotificationOptions): void {
	if (Notification.permission === 'granted') {
		new Notification(title, {
			icon: '/icon-192.png',
			badge: '/icon-192.png',
			...options
		});
	}
}

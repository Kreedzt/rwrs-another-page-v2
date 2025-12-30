/**
 * Background Sync Service
 * Register sync events when offline - queue failed requests
 * Sync when network is restored
 */

/**
 * Register a background sync event
 * @param tag - Unique identifier for the sync event
 */
export function registerSync(tag: string): void {
	if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
		navigator.serviceWorker.ready.then((registration) => {
			registration.sync.register(tag).catch((err) => {
				console.error(`Sync registration failed for "${tag}":`, err);
			});
		});
	} else {
		console.warn('Background Sync API not supported');
	}
}

/**
 * Queue a server list refresh for background sync
 */
export function queueServerRefresh(): void {
	registerSync('server-refresh');
}

/**
 * Check if background sync is supported
 */
export function isBackgroundSyncSupported(): boolean {
	return 'serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype;
}

/**
 * Register a periodic background sync (for supported browsers)
 * Note: Periodic Background Sync API has limited browser support
 * @param tag - Unique identifier for the periodic sync
 * @param minInterval - Minimum interval in milliseconds
 */
export function registerPeriodicSync(tag: string, minInterval: number): void {
	if ('serviceWorker' in navigator && 'periodicSync' in ServiceWorkerRegistration.prototype) {
		navigator.serviceWorker.ready.then((registration) => {
			// Check if periodic sync is already registered
			(registration as any).periodicSync
				.getTags()
				.then((tags: string[]) => {
					if (tags.includes(tag)) {
						return;
					}

					return (registration as any).periodicSync.register(tag, {
						minInterval
					});
				})
				.catch((err: Error) => {
					console.error(`Periodic sync registration failed for "${tag}":`, err);
				});
		});
	} else {
		console.warn('Periodic Background Sync API not supported');
	}
}

/**
 * Unregister a periodic background sync
 */
export function unregisterPeriodicSync(tag: string): void {
	if ('serviceWorker' in navigator && 'periodicSync' in ServiceWorkerRegistration.prototype) {
		navigator.serviceWorker.ready.then((registration) => {
			(registration as any).periodicSync.unregister(tag).catch((err: Error) => {
				console.error(`Periodic sync unregistration failed for "${tag}":`, err);
			});
		});
	}
}

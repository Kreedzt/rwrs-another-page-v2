/**
 * IndexedDB wrapper for caching server list and player data
 * Provides offline fallback for API requests
 */

interface CachedData<T> {
	data: T;
	timestamp: number;
}

export class CacheStorage {
	private db: IDBDatabase | null = null;
	private readonly DB_NAME = 'robin-cache';
	private readonly DB_VERSION = 1;
	private initPromise: Promise<void> | null = null;

	async init(): Promise<void> {
		// Return existing promise if init is in progress
		if (this.initPromise) {
			return this.initPromise;
		}

		this.initPromise = new Promise((resolve, reject) => {
			const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

			request.onerror = () => {
				reject(request.error);
				this.initPromise = null;
			};

			request.onsuccess = () => {
				this.db = request.result;
				resolve();
			};

			request.onupgradeneeded = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;

				// Create servers store
				if (!db.objectStoreNames.contains('servers')) {
					const serverStore = db.createObjectStore('servers', { keyPath: 'id' });
					serverStore.createIndex('timestamp', 'timestamp', { unique: false });
				}

				// Create players store
				if (!db.objectStoreNames.contains('players')) {
					const playerStore = db.createObjectStore('players', { keyPath: 'id' });
					playerStore.createIndex('timestamp', 'timestamp', { unique: false });
				}

				// Create generic cache store for other data
				if (!db.objectStoreNames.contains('cache')) {
					const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
					cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
				}
			};
		});

		return this.initPromise;
	}

	async set<T>(storeName: string, key: string, data: T): Promise<void> {
		if (!this.db) await this.init();

		return new Promise((resolve, reject) => {
			const tx = this.db!.transaction(storeName, 'readwrite');
			const store = tx.objectStore(storeName);
			const request = store.put({ key, data, timestamp: Date.now() });

			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	async get<T>(storeName: string, key: string): Promise<T | null> {
		if (!this.db) await this.init();

		return new Promise((resolve) => {
			const tx = this.db!.transaction(storeName, 'readonly');
			const store = tx.objectStore(storeName);
			const request = store.get(key);

			request.onsuccess = () => {
				const result = request.result as CachedData<T> | undefined;
				resolve(result?.data ?? null);
			};

			request.onerror = () => resolve(null);
		});
	}

	async getAll<T>(storeName: string): Promise<T[]> {
		if (!this.db) await this.init();

		return new Promise((resolve) => {
			const tx = this.db!.transaction(storeName, 'readonly');
			const store = tx.objectStore(storeName);
			const request = store.getAll();

			request.onsuccess = () => {
				const results = request.result as CachedData<T>[];
				resolve(results.map((r) => r.data));
			};

			request.onerror = () => resolve([]);
		});
	}

	async delete(storeName: string, key: string): Promise<void> {
		if (!this.db) await this.init();

		return new Promise((resolve, reject) => {
			const tx = this.db!.transaction(storeName, 'readwrite');
			const store = tx.objectStore(storeName);
			const request = store.delete(key);

			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	async clear(storeName: string): Promise<void> {
		if (!this.db) await this.init();

		return new Promise((resolve, reject) => {
			const tx = this.db!.transaction(storeName, 'readwrite');
			const store = tx.objectStore(storeName);
			const request = store.clear();

			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	/**
	 * Get cached data with age check
	 * @returns null if cache is expired, otherwise returns cached data
	 */
	async getWithAge<T>(
		storeName: string,
		key: string,
		maxAgeMs: number = 5 * 60 * 1000
	): Promise<T | null> {
		if (!this.db) await this.init();

		return new Promise((resolve) => {
			const tx = this.db!.transaction(storeName, 'readonly');
			const store = tx.objectStore(storeName);
			const request = store.get(key);

			request.onsuccess = () => {
				const result = request.result as CachedData<T> | undefined;
				if (!result) {
					resolve(null);
					return;
				}

				const age = Date.now() - result.timestamp;
				if (age > maxAgeMs) {
					// Cache expired
					resolve(null);
				} else {
					resolve(result.data);
				}
			};

			request.onerror = () => resolve(null);
		});
	}
}

// Singleton instance
export const cacheStorage = new CacheStorage();

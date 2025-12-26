// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	// Analytics global type definitions
	interface Window {
		// Google Analytics (gtag)
		gtag?: GTag;
		dataLayer?: unknown[];
		// Baidu Analytics (_hmt)
		_hmt?: unknown[];
		// Umami Analytics
		umami?: Umami;
	}

	interface GTag {
		(command: 'config' | 'js', target: string, config?: unknown): void;
		(command: 'event' | 'js', eventName: string, eventParams?: Record<string, unknown>): void;
		(command: 'set', target: 'user_properties', config: Record<string, unknown>): void;
		(command: 'consent', consent: 'update' | 'default', config: Record<string, string>): void;
	}

	interface Umami {
		track: (eventName: string, data?: Record<string, string | number | boolean>) => void;
		trackView: (url?: string, name?: string) => void;
	}
}

export {};

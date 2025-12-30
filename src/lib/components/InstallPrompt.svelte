<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import TranslatedText from './TranslatedText.svelte';

	let deferredPrompt: Event | null = null;
	let showInstallPrompt = $state(false);

	onMount(() => {
		if (!browser) return;

		// Check if app is already installed
		const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
			(window.navigator as any).standalone === true;

		if (isInstalled) {
			return;
		}

		// Check if user has dismissed the prompt
		const dismissed = localStorage.getItem('pwa-install-prompt-dismissed');
		if (dismissed === 'true') {
			return;
		}

		const handler = (e: Event) => {
			// Prevent Chrome 67 and earlier from automatically showing the prompt
			e.preventDefault();
			deferredPrompt = e;
			showInstallPrompt = true;
		};

		window.addEventListener('beforeinstallprompt', handler);

		return () => {
			window.removeEventListener('beforeinstallprompt', handler);
		};
	});

	async function installApp() {
		if (!deferredPrompt) return;

		// Show the install prompt
		(deferredPrompt as any).prompt();
		const { outcome } = await (deferredPrompt as any).userChoice;

		if (outcome === 'accepted') {
			showInstallPrompt = false;
		}

		deferredPrompt = null;
	}

	function dismiss() {
		showInstallPrompt = false;
		localStorage.setItem('pwa-install-prompt-dismissed', 'true');
	}
</script>

{#if showInstallPrompt}
	<div class="alert alert-success fixed bottom-4 right-4 z-50 flex max-w-sm items-center gap-4 shadow-lg transition-all">
		<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
		</svg>
		<div class="flex-1">
			<p class="font-bold"><TranslatedText key="app.pwa.install.title" /></p>
			<p class="text-sm opacity-90"><TranslatedText key="app.pwa.install.description" /></p>
		</div>
		<div class="flex gap-2">
			<button class="btn btn-sm btn-ghost" onclick={dismiss}><TranslatedText key="app.pwa.install.later" /></button>
			<button class="btn btn-sm btn-primary" onclick={installApp}><TranslatedText key="app.pwa.install.button" /></button>
		</div>
	</div>
{/if}

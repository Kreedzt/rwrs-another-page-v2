<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import TranslatedText from '$lib/components/TranslatedText.svelte';
	import SearchInput from '$lib/components/SearchInput.svelte';
	import PlayerDatabaseSelector from '$lib/components/PlayerDatabaseSelector.svelte';
	import ColumnsToggle from '$lib/components/ColumnsToggle.svelte';
	import AutoRefresh from '$lib/components/AutoRefresh.svelte';
	import type { PlayerDatabase } from '$lib/models/player.model';
	import type { IColumn } from '$lib/models/data-table.model';

	interface Props {
		currentView: 'servers' | 'players';
		playerDb: PlayerDatabase;
		searchQuery: string;
		searchPlaceholder: string;
		autoRefreshEnabled: boolean;
		columns: IColumn[];
		visibleColumns: Record<string, boolean>;
		onPlayerDbChange: (db: PlayerDatabase) => void;
		onRefresh: () => Promise<void>;
		onAutoRefreshToggle: (enabled: boolean) => void;
		onSearchInput: (value: string) => void;
		onSearchEnter?: (value: string) => void;
		onColumnToggle: (column: IColumn, visible: boolean) => void;
		onSearchRef?: (input: HTMLInputElement | null) => void;
	}

	let {
		currentView,
		playerDb,
		searchQuery,
		searchPlaceholder,
		autoRefreshEnabled,
		columns,
		visibleColumns,
		onPlayerDbChange,
		onRefresh,
		onAutoRefreshToggle,
		onSearchInput,
		onSearchEnter,
		onColumnToggle,
		onSearchRef
	}: Props = $props();

	// Auto refresh is only available for servers view
	const showAutoRefresh = $derived(currentView === 'servers');

	// Dynamic search placeholder based on view
	const dynamicPlaceholder = $derived(
		currentView === 'players'
			? m['app.search.placeholderPlayers']()
			: searchPlaceholder
	);
</script>

<div class="mb-4 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
	<!-- Left side: Player DB selector (only in players view) + Search input -->
	<div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
		{#if currentView === 'players'}
			<PlayerDatabaseSelector currentDb={playerDb} onDbChange={onPlayerDbChange} />
		{/if}
		<div class="min-w-48 flex-1">
			<SearchInput
				placeholder={dynamicPlaceholder}
				bind:value={searchQuery}
				oninput={onSearchInput}
				onEnter={onSearchEnter}
				onRef={onSearchRef}
			/>
		</div>
	</div>

	<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
		<button class="btn btn-neutral w-full min-w-20 sm:w-auto" onclick={onRefresh}>
			<TranslatedText key="app.button.refresh" />
		</button>

		<div class="hidden md:block">
			<ColumnsToggle {columns} {visibleColumns} onColumnToggle={onColumnToggle} />
		</div>

		{#if showAutoRefresh}
			<AutoRefresh
				enabled={autoRefreshEnabled}
				onRefresh={onRefresh}
				onToggleChange={onAutoRefreshToggle}
			/>
		{/if}
	</div>
</div>

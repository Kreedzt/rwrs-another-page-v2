<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import TranslatedText from '$lib/components/TranslatedText.svelte';
	import SearchInput from '$lib/components/SearchInput.svelte';
	import PlayerDatabaseSelector from '$lib/components/PlayerDatabaseSelector.svelte';
	import ColumnsToggle from '$lib/components/ColumnsToggle.svelte';
	import AutoRefresh from '$lib/components/AutoRefresh.svelte';
	import type { PlayerDatabase, IPlayerColumn } from '$lib/models/player.model';
	import type { IColumn } from '$lib/models/server.model';
	import analytics from '$lib/utils/analytics';

	interface Props {
		currentView: 'servers' | 'players';
		playerDb: PlayerDatabase;
		searchQuery: string;
		searchPlaceholder: string;
		autoRefreshEnabled: boolean;
		columns: IColumn[];
		playerColumns: IPlayerColumn[];
		visibleColumns: Record<string, boolean>;
		visiblePlayerColumns: Record<string, boolean>;
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
		playerColumns,
		visibleColumns,
		visiblePlayerColumns,
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

	// Use appropriate columns based on current view
	const currentColumns = $derived(currentView === 'players' ? playerColumns : columns);
	const currentVisibleColumns = $derived(currentView === 'players' ? visiblePlayerColumns : visibleColumns);

	// Dynamic search placeholder based on view
	const dynamicPlaceholder = $derived(
		currentView === 'players'
			? m['app.search.placeholderPlayers']()
			: searchPlaceholder
	);

	function handleRefresh() {
		onRefresh();
		analytics.trackRefresh();
	}
</script>

<div class="mb-4 md:mb-2 flex flex-col items-stretch gap-4 rounded-lg border border-mil bg-mil-secondary p-4 sm:flex-row sm:items-center">
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
		<button class="btn-tactical w-full min-w-24 px-4 py-2 sm:w-auto" onclick={handleRefresh}>
			<TranslatedText key="app.button.refresh" />
		</button>

		<div class="hidden md:block">
			<ColumnsToggle columns={currentColumns} visibleColumns={currentVisibleColumns} onColumnToggle={onColumnToggle} />
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

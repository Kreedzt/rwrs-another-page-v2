<script lang="ts">
	import { onMount } from 'svelte';
	import { DataTableService } from '@/services/data-table';
	import type { IDisplayServerItem } from '@/models/data-table.model';

	let servers: IDisplayServerItem[] = [];
	let loading = true;
	let error: string | null = null;
	let searchQuery = '';

	// Pagination
	const itemsPerPage = 20;
	let currentPage = 1;
	let totalPages = 0;

	// Column display order as specified
	const columns = [
		{ key: 'name', label: 'Name' },
		{ key: 'ipAddress', label: 'IP Address' },
		{ key: 'port', label: 'Port' },
		{ key: 'bots', label: 'Bots' },
		{ key: 'country', label: 'Country' },
		{ key: 'mode', label: 'Mode' },
		{ key: 'mapId', label: 'Map ID' },
		{
			key: 'playerCount',
			label: 'Players',
			getValue: (server: IDisplayServerItem) => `${server.currentPlayers}/${server.maxPlayers}`
		},
		{
			key: 'playerList',
			label: 'Player List',
			getValue: (server: IDisplayServerItem) => server.playerList.join(', ')
		},
		{ key: 'comment', label: 'Comment' },
		{
			key: 'dedicated',
			label: 'Dedicated',
			getValue: (server: IDisplayServerItem) => (server.dedicated ? 'Yes' : 'No')
		},
		{ key: 'mod', label: 'Mod' },
		{ key: 'url', label: 'URL' },
		{ key: 'version', label: 'Version' },
		{ key: 'action', label: 'Action', getValue: () => '' }
	];

	// Filter servers based on search query
	$: filteredServers = searchQuery
		? servers.filter(server => {
			const query = searchQuery.toLowerCase();
			return (
				server.name.toLowerCase().includes(query) ||
				server.ipAddress.toLowerCase().includes(query) ||
				server.port.toString().includes(query) ||
				server.country.toLowerCase().includes(query) ||
				server.mode.toLowerCase().includes(query) ||
				server.mapId.toLowerCase().includes(query) ||
				(server.comment && server.comment.toLowerCase().includes(query)) ||
				server.playerList.some(player => player.toLowerCase().includes(query))
			);
		})
		: servers;

	// Calculate total pages
	$: totalPages = Math.ceil(filteredServers.length / itemsPerPage);

	// Get current page data
	$: paginatedServers = filteredServers.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	// Reset to first page when search query changes
	$: if (searchQuery) {
		currentPage = 1;
	}

	// Highlight matching text in a string
	function highlightMatch(text: string, query: string): string {
		if (!query || !text) return text;

		const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
		return text.replace(regex, '<mark class="bg-accent text-accent-content">$1</mark>');
	}

	// Generate an array of page numbers to display
	function generatePageNumbers(current: number, total: number, maxVisible: number): number[] {
		// If we have fewer pages than the max we want to show, just return all pages
		if (total <= maxVisible) {
			return Array.from({ length: total }, (_, i) => i + 1);
		}

		// Calculate the start and end of the visible page range
		let start = Math.max(1, current - Math.floor(maxVisible / 2));
		let end = start + maxVisible - 1;

		// Adjust if we're near the end
		if (end > total) {
			end = total;
			start = Math.max(1, end - maxVisible + 1);
		}

		// Generate the array of page numbers
		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	}

	// Navigate to a specific page
	function goToPage(page: number) {
		if (page >= 1 && page <= totalPages) {
			currentPage = page;
		}
	}

	onMount(async () => {
		try {
			loading = true;
			servers = await DataTableService.listAll();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load servers';
			console.error('Error loading servers:', err);
		} finally {
			loading = false;
		}
	});

	function handleConnect(server: IDisplayServerItem) {
		// This would be implemented to handle connection to the server
		alert(`Connecting to ${server.name} at ${server.ipAddress}:${server.port}`);
	}
</script>

<svelte:head>
	<title>RWRS Another Page</title>
	<meta name="description" content="Running with Rifles Servers Stats Page" />
</svelte:head>

<section>
	<div class="container mx-auto px-4 py-8">
		<div class="form-control w-full mb-4">
			<div class="input-group w-full">
				<input
					type="text"
					placeholder="Search servers, maps, players, mode, country, etc..."
					class="input input-bordered w-full"
					bind:value={searchQuery}
				/>
				{#if searchQuery}
					<button class="btn btn-square" on:click={() => searchQuery = ''} aria-label="Clear search">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				{:else}
					<button class="btn btn-square" aria-label="Search">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
					</button>
				{/if}
			</div>
		</div>

		{#if loading}
			<div class="flex h-64 items-center justify-center">
				<span class="loading loading-spinner loading-lg text-primary"></span>
			</div>
		{:else if error}
			<div class="alert alert-error">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 shrink-0 stroke-current"
					fill="none"
					viewBox="0 0 24 24"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
					/></svg
				>
				<span>{error}</span>
			</div>
		{:else if filteredServers.length === 0}
			<div class="alert alert-info">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					class="h-6 w-6 shrink-0 stroke-current"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					></path></svg
				>
				<span>No servers found{searchQuery ? ' matching your search' : ''}.</span>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="table">
					<thead>
						<tr>
							{#each columns as column}
								<th>{column.label}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each paginatedServers as server}
							<tr class="hover hover:bg-base-300">
								{#each columns as column}
									<td>
										{#if column.key === 'action'}
											<button class="btn btn-sm btn-primary" on:click={() => handleConnect(server)}>
												Connect
											</button>
										{:else if column.key === 'url' && server.url}
											<a href={server.url} target="_blank" class="link link-primary">
												{#if searchQuery && server.url.toLowerCase().includes(searchQuery.toLowerCase())}
													{@html highlightMatch(server.url, searchQuery)}
												{:else}
													{server.url}
												{/if}
											</a>
										{:else if column.getValue}
											{#if searchQuery && column.key === 'playerList' && server.playerList.some(player => player.toLowerCase().includes(searchQuery.toLowerCase()))}
												{@html highlightMatch(server.playerList.join(', '), searchQuery)}
											{:else}
												{column.getValue(server)}
											{/if}
										{:else}
											{#if searchQuery && server[column.key as keyof IDisplayServerItem] && typeof server[column.key as keyof IDisplayServerItem] === 'string' && (server[column.key as keyof IDisplayServerItem] as string).toLowerCase().includes(searchQuery.toLowerCase())}
												{@html highlightMatch(server[column.key as keyof IDisplayServerItem] as string, searchQuery)}
											{:else}
												{server[column.key as keyof IDisplayServerItem] ?? '-'}
											{/if}
										{/if}
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>

				<!-- Pagination -->
				{#if totalPages > 1}
					<div class="flex justify-center items-center mt-4 space-x-2">
						<div class="join">
							<button
								class="join-item btn"
								disabled={currentPage === 1}
								on:click={() => goToPage(1)}
							>
								«
							</button>
							<button
								class="join-item btn"
								disabled={currentPage === 1}
								on:click={() => goToPage(currentPage - 1)}
							>
								‹
							</button>

							{#each generatePageNumbers(currentPage, totalPages, 5) as pageNum}
								<button
									class="join-item btn {currentPage === pageNum ? 'btn-active' : ''}"
									on:click={() => goToPage(pageNum)}
								>
									{pageNum}
								</button>
							{/each}

							<button
								class="join-item btn"
								disabled={currentPage === totalPages}
								on:click={() => goToPage(currentPage + 1)}
							>
								›
							</button>
							<button
								class="join-item btn"
								disabled={currentPage === totalPages}
								on:click={() => goToPage(totalPages)}
							>
								»
							</button>
						</div>
						<span class="text-sm">
							Page {currentPage} of {totalPages} ({filteredServers.length} servers)
						</span>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}
</style>

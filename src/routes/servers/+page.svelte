<script lang="ts">
	import { onMount } from 'svelte';
	import { DataTableService } from '@/services/data-table';
	import type { IDisplayServerItem } from '@/models/data-table.model';

	let servers: IDisplayServerItem[] = [];
	let loading = true;
	let error: string | null = null;

	// Column display order as specified
	const columns = [
		{ key: 'name', label: 'Name' },
		{ key: 'ipAddress', label: 'IP Address' },
		{ key: 'port', label: 'Port' },
		{ key: 'bots', label: 'Bots' },
		{ key: 'country', label: 'Country' },
		{ key: 'mode', label: 'Mode' },
		{ key: 'mapId', label: 'Map ID' },
		{ key: 'playerCount', label: 'Players', getValue: (server: IDisplayServerItem) => `${server.currentPlayers}/${server.maxPlayers}` },
		{ key: 'playerList', label: 'Player List', getValue: (server: IDisplayServerItem) => server.playerList.join(', ') },
		{ key: 'comment', label: 'Comment' },
		{ key: 'dedicated', label: 'Dedicated', getValue: (server: IDisplayServerItem) => server.dedicated ? 'Yes' : 'No' },
		{ key: 'mod', label: 'Mod' },
		{ key: 'url', label: 'URL' },
		{ key: 'version', label: 'Version' },
		{ key: 'action', label: 'Action', getValue: () => '' }
	];

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
	<title>Server List</title>
	<meta name="description" content="List of available servers" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<h1 class="text-3xl font-bold mb-6">Server List</h1>

	{#if loading}
		<div class="flex justify-center items-center h-64">
			<span class="loading loading-spinner loading-lg text-primary"></span>
		</div>
	{:else if error}
		<div class="alert alert-error">
			<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
			<span>{error}</span>
		</div>
	{:else if servers.length === 0}
		<div class="alert alert-info">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
			<span>No servers found.</span>
		</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="table table-zebra">
				<thead>
					<tr>
						{#each columns as column}
							<th>{column.label}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each servers as server}
						<tr class="hover">
							{#each columns as column}
								<td>
									{#if column.key === 'action'}
										<button class="btn btn-sm btn-primary" on:click={() => handleConnect(server)}>
											Connect
										</button>
									{:else if column.key === 'url' && server.url}
										<a href={server.url} target="_blank" class="link link-primary">{server.url}</a>
									{:else if column.getValue}
										{column.getValue(server)}
									{:else}
										{server[column.key as keyof IDisplayServerItem] ?? '-'}
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

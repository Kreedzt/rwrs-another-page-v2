<script lang="ts">
	interface Props {
		placeholder?: string;
		value?: string;
		search: (query: string) => void;
		clear: () => void;
	}

	let { placeholder = 'Search...', value = '', search, clear }: Props = $props();

	// Handle input changes
	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;
		search(value);
	}

	// Clear search
	function clearSearch() {
		value = '';
		clear();
		search('');
	}
</script>

<div class="form-control w-full">
	<div class="input-group w-full">
		<input
			type="text"
			{placeholder}
			class="input input-bordered w-full"
			{value}
			oninput={handleInput}
		/>
		{#if value}
			<button class="btn btn-square" onclick={clearSearch} aria-label="Clear search">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		{:else}
			<button class="btn btn-square" aria-label="Search">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
			</button>
		{/if}
	</div>
</div>

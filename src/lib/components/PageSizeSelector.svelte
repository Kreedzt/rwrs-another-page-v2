<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import TranslatedText from '$lib/components/TranslatedText.svelte';

	interface Props {
		currentSize: number;
		onSizeChange: (size: number) => void;
		min?: number;
		max?: number;
		options?: number[];
	}

	let {
		currentSize,
		onSizeChange,
		min = 10,
		max = 100,
		options = [10, 20, 50, 100]
	}: Props = $props();

	const filteredOptions = options.filter((size) => size >= min && size <= max);

	function handleChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		onSizeChange(Number(select.value));
	}
</script>

<select
	class="select select-bordered w-full min-w-32 sm:w-auto"
	value={currentSize}
	onchange={handleChange}
>
	{#each filteredOptions as size (size)}
		<option value={size}>{size} / {m['app.pagination.page']()}</option>
	{/each}
</select>

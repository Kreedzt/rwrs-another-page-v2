<script lang="ts">
	import TranslatedText from '$lib/components/TranslatedText.svelte';
	import { m } from '$lib/paraglide/messages.js';

	interface Props {
		currentPage: number;
		hasNext: boolean;
		hasPrevious: boolean;
		onPageChange: (page: number) => void;
	}

	let { currentPage, hasNext, hasPrevious, onPageChange }: Props = $props();

	function goToPage(page: number) {
		onPageChange(page);
	}
</script>

<div class="join">
	<!-- Previous page button -->
	<button
		class="join-item btn btn-sm"
		disabled={!hasPrevious}
		onclick={() => goToPage(currentPage - 1)}
		title={m['app.paginationControl.previousPage']()}
	>
		‹
	</button>

	<!-- Current page indicator -->
	<button class="join-item btn btn-sm btn-active">
		{currentPage}
	</button>

	<!-- Next page button -->
	<button
		class="join-item btn btn-sm"
		disabled={!hasNext}
		onclick={() => goToPage(currentPage + 1)}
		title={m['app.paginationControl.nextPage']()}
	>
		›
	</button>
</div>

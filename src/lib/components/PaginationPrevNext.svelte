<script lang="ts">
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
		class="join-item btn"
		disabled={!hasPrevious}
		onclick={() => goToPage(currentPage - 1)}
		title="Previous page"
	>
		‹
	</button>

	<!-- Current page indicator -->
	<button class="join-item btn btn-active">
		Page {currentPage}
	</button>

	<!-- Next page button -->
	<button
		class="join-item btn"
		disabled={!hasNext}
		onclick={() => goToPage(currentPage + 1)}
		title="Next page"
	>
		›
	</button>
</div>

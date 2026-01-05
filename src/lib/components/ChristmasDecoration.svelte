<script lang="ts">
	import { Snowflake } from '@lucide/svelte';

	// Christmas header decoration component
	// Holiday theme blended with military style
</script>

<div class="christmas-decoration inline-flex items-center gap-2">
	<!-- Left snowflake decoration -->
	<Snowflake
		class="snowflake-icon-left w-4 h-4 md:w-5 md:h-5 text-blue-300 dark:text-blue-200"
		aria-hidden="true"
	/>

	<!-- Right snowflake decoration -->
	<Snowflake
		class="snowflake-icon-right w-3 h-3 md:w-4 md:h-4 text-cyan-300 dark:text-cyan-200"
		aria-hidden="true"
	/>
</div>

<style>
	.snowflake-icon-left {
		animation: spin 8s linear infinite;
	}

	.snowflake-icon-right {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}
</style>


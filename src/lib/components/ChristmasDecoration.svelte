<script lang="ts">
	import { Snowflake } from '@lucide/svelte';
	
	// Christmas header decoration component
	// Holiday theme blended with military style
</script>

<div class="christmas-decoration inline-flex items-center gap-2">
	<!-- Left snowflake decoration -->
	<Snowflake 
		class="snowflake-icon w-4 h-4 md:w-5 md:h-5 text-blue-300 dark:text-blue-200 animate-spin-slow" 
		aria-hidden="true"
	/>
	
	<!-- Right snowflake decoration -->
	<Snowflake 
		class="snowflake-icon w-3 h-3 md:w-4 md:h-4 text-cyan-300 dark:text-cyan-200 animate-pulse" 
		aria-hidden="true"
	/>
</div>

<style>
	/* Custom slow rotation animation */
	:global(.animate-spin-slow) {
		animation: spin 8s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>


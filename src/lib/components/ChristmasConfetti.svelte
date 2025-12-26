<script lang="ts">
	import { confetti } from '@neoconfetti/svelte';
	
	// 交互式圣诞彩纸效果组件
	// 使用项目已安装的 @neoconfetti/svelte
	
	let showConfetti = $state(false);
	
	export function trigger() {
		showConfetti = true;
		setTimeout(() => {
			showConfetti = false;
		}, 3000);
	}
</script>

{#if showConfetti}
	<div
		class="confetti-container pointer-events-none fixed left-1/2 top-20 z-[60]"
		use:confetti={{
			particleCount: 50,
			force: 0.5,
			stageWidth: window.innerWidth,
			stageHeight: window.innerHeight,
			colors: ['#bae6fd', '#e0f2fe', '#ffffff', '#7dd3fc', '#38bdf8'],
			destroyAfterDone: true,
			duration: 3000
		}}
	/>
{/if}

<style>
	.confetti-container {
		transform: translateX(-50%);
	}
</style>


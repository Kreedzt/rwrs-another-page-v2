<script lang="ts">
	import { onMount } from 'svelte';
	
	// 响应式圣诞雪花背景效果 - 纯 CSS 实现
	// PC端：50个雪花，移动端：10个雪花
	
	let snowflakeCount = $state(10); // 默认移动端数量
	let snowflakes = $state<Array<{
		id: number;
		left: number;
		animationDelay: number;
		animationDuration: number;
		size: number;
		opacity: number;
	}>>([]);
	
	function generateSnowflakes(count: number) {
		return Array.from({ length: count }, (_, i) => ({
			id: i,
			left: Math.random() * 100,
			animationDelay: Math.random() * 10,
			animationDuration: 10 + Math.random() * 10,
			size: 0.5 + Math.random() * 1.5,
			opacity: 0.3 + Math.random() * 0.4
		}));
	}
	
	function updateSnowflakeCount() {
		// PC端（>= 768px）：50个雪花
		// 移动端（< 768px）：10个雪花
		const isMobile = window.innerWidth < 768;
		const newCount = isMobile ? 10 : 50;
		
		if (newCount !== snowflakeCount) {
			snowflakeCount = newCount;
			snowflakes = generateSnowflakes(newCount);
		}
	}
	
	onMount(() => {
		// 初始化
		updateSnowflakeCount();
		
		// 监听窗口尺寸变化
		window.addEventListener('resize', updateSnowflakeCount);
		
		return () => {
			window.removeEventListener('resize', updateSnowflakeCount);
		};
	});
</script>

<div class="christmas-snowfall pointer-events-none fixed inset-0 z-50" aria-hidden="true">
	{#each snowflakes as flake (flake.id)}
		<div
			class="snowflake absolute"
			style="
				left: {flake.left}%;
				animation-delay: {flake.animationDelay}s;
				animation-duration: {flake.animationDuration}s;
				font-size: {flake.size}rem;
				opacity: {flake.opacity};
			"
		>
			❄
		</div>
	{/each}
</div>

<style>
	.christmas-snowfall {
		overflow: hidden;
	}

	.snowflake {
		color: #fff;
		user-select: none;
		animation: fall linear infinite;
		text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
	}

	@keyframes fall {
		0% {
			transform: translateY(-10vh) rotate(0deg);
		}
		100% {
			transform: translateY(110vh) rotate(360deg);
		}
	}

	/* 移动端优化：减少模糊效果 */
	@media (max-width: 768px) {
		.snowflake {
			text-shadow: 0 0 3px rgba(255, 255, 255, 0.3);
		}
	}

	/* 深色模式下雪花更明显 */
	:global([data-theme='dark']) .snowflake {
		color: #e0f2fe;
		text-shadow: 0 0 8px rgba(224, 242, 254, 0.6);
	}

	/* 浅色模式下雪花稍微透明 */
	:global([data-theme='light']) .snowflake {
		color: #bae6fd;
		text-shadow: 0 0 5px rgba(186, 230, 253, 0.4);
	}
</style>


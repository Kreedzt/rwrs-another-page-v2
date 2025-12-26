<script lang="ts">
	import { Snowflake } from '@lucide/svelte';
	
	// 页头圣诞装饰组件
	// 与军事风格融合的节日主题
</script>

<div class="christmas-decoration inline-flex items-center gap-2">
	<!-- 左侧雪花装饰 -->
	<Snowflake 
		class="snowflake-icon w-4 h-4 md:w-5 md:h-5 text-blue-300 dark:text-blue-200 animate-spin-slow" 
		aria-hidden="true"
	/>
	
	<!-- 右侧雪花装饰 -->
	<Snowflake 
		class="snowflake-icon w-3 h-3 md:w-4 md:h-4 text-cyan-300 dark:text-cyan-200 animate-pulse" 
		aria-hidden="true"
	/>
</div>

<style>
	/* 自定义慢速旋转动画 */
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

	.snowflake-icon {
		filter: drop-shadow(0 0 4px rgba(147, 197, 253, 0.6));
		transition: all 0.3s ease;
	}

	/* 悬停效果 */
	.christmas-decoration:hover .snowflake-icon {
		filter: drop-shadow(0 0 8px rgba(147, 197, 253, 0.8));
		transform: scale(1.1);
	}

	/* 深色模式优化 */
	:global([data-theme='dark']) .snowflake-icon {
		filter: drop-shadow(0 0 6px rgba(186, 230, 253, 0.7));
	}

	/* 移动端简化效果 */
	@media (max-width: 768px) {
		.snowflake-icon {
			filter: drop-shadow(0 0 2px rgba(147, 197, 253, 0.4));
		}
	}
</style>


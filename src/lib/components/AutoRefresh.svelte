<script lang="ts">
	import { onDestroy } from 'svelte';
	import { m } from '$lib/paraglide/messages.js';

	interface Props {
		enabled: boolean;
		onRefresh: () => Promise<void>;
		onToggleChange?: (enabled: boolean) => void;
	}

	let { enabled = false, onRefresh, onToggleChange = () => {} }: Props = $props();

	let intervalId: number | null = null;
	let nextRefreshCountdown = $state(0);
	const REFRESH_INTERVAL = 5; // 固定5秒刷新间隔

	function startAutoRefresh() {
		if (intervalId) {
			clearInterval(intervalId);
		}

		if (!enabled) return;

		nextRefreshCountdown = REFRESH_INTERVAL;

		// 立即执行一次刷新
		onRefresh();

		// 设置倒计时
		intervalId = setInterval(() => {
			nextRefreshCountdown--;
			if (nextRefreshCountdown <= 0) {
				nextRefreshCountdown = REFRESH_INTERVAL;
				onRefresh();
			}
		}, 1000) as unknown as number;
	}

	function stopAutoRefresh() {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
		nextRefreshCountdown = 0;
	}

	function handleToggleChange(event: Event) {
		const target = event.target as HTMLInputElement;
		enabled = target.checked;
		onToggleChange(enabled);

		if (enabled) {
			startAutoRefresh();
		} else {
			stopAutoRefresh();
		}
	}

	// 启动或停止自动刷新
	$effect(() => {
		if (enabled) {
			startAutoRefresh();
		} else {
			stopAutoRefresh();
		}
	});

	// 组件销毁时清理定时器
	onDestroy(() => {
		stopAutoRefresh();
	});
</script>

<!-- 简化的自动刷新开关 -->
<label class="flex cursor-pointer items-center gap-3 sm:gap-2">
	<input
		type="checkbox"
		checked={enabled}
		onchange={handleToggleChange}
		class="toggle toggle-primary toggle-md sm:toggle-sm"
	/>
	<span class="text-sm whitespace-nowrap sm:text-xs">
		{m['app.autoRefresh.toggle']()}
	</span>
	{#if enabled}
		<div class="ml-2 flex items-center gap-2 sm:ml-2 sm:gap-1">
			<div class="bg-success h-3 w-3 animate-pulse rounded-full sm:h-2 sm:w-2"></div>
			<span class="text-base-content/70 text-sm font-medium sm:text-xs sm:font-normal">
				{nextRefreshCountdown}s
			</span>
		</div>
	{/if}
</label>

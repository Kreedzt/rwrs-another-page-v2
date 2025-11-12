<script lang="ts">
	import { onDestroy } from 'svelte';
	import { m } from '$lib/paraglide/messages.js';

	interface Props {
		enabled: boolean;
		onRefresh: () => Promise<void>;
		onToggleChange?: (enabled: boolean) => void;
	}

	let {
		enabled = false,
		onRefresh,
		onToggleChange = () => {}
	}: Props = $props();

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
<label class="flex items-center gap-2 cursor-pointer">
	<input
		type="checkbox"
		checked={enabled}
		onchange={handleToggleChange}
		class="toggle toggle-primary toggle-sm"
	/>
	<span class="text-sm whitespace-nowrap">
		{m['app.autoRefresh.toggle']()}
	</span>
	{#if enabled}
		<div class="flex items-center gap-1 ml-2">
			<div class="w-2 h-2 bg-success rounded-full animate-pulse"></div>
			<span class="text-xs text-base-content/70">
				{nextRefreshCountdown}s
			</span>
		</div>
	{/if}
</label>
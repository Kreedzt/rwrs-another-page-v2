<script lang="ts">
	import { Search } from "@lucide/svelte";

	interface Props {
		placeholder?: string;
		value?: string;
		oninput?: (value: string) => void;
		onEnter?: (value: string) => void;
		onRef?: (input: HTMLInputElement) => void;
	}

	let { placeholder = 'Search...', value = $bindable(''), oninput, onEnter, onRef }: Props = $props();

	let inputElement: HTMLInputElement;

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		oninput?.(target.value);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			const target = e.target as HTMLInputElement;
			onEnter?.(target.value);
		}
	}

	// Expose the input element to parent
	$effect(() => {
		if (inputElement && onRef) {
			onRef(inputElement);
		}
	});

	// Expose methods to parent component
	export const focus = () => inputElement?.focus();
	export const blur = () => inputElement?.blur();
	export const element = () => inputElement;
</script>

<div class="form-control flex-1">
	<label class="input input-bordered w-full focus-within:outline-none">
		<Search class="h-[1em] opacity-50" />
		<input
			bind:this={inputElement}
			type="search"
			{placeholder}
			class="grow focus:outline-none"
			bind:value
			oninput={handleInput}
			onkeydown={handleKeydown}
		/>
	</label>
</div>

<style>
	/* 彻底移除浏览器默认的聚焦样式 */
	.input:focus-within {
		outline: none !important;
		box-shadow: none !important;
		border-color: hsl(var(--bc) / 0.3) !important;
	}

	.input input:focus {
		outline: none !important;
		box-shadow: none !important;
		border: none !important;
	}

	/* 移除 search 输入框的特殊样式 */
	input[type='search']:focus {
		outline: none !important;
		box-shadow: none !important;
		border: none !important;
		-webkit-appearance: none !important;
		-moz-appearance: none !important;
		appearance: none !important;
	}

	/* 移除 WebKit 浏览器的默认样式 */
	input[type='search']::-webkit-search-decoration,
	input[type='search']::-webkit-search-cancel-button,
	input[type='search']::-webkit-search-results-button,
	input[type='search']::-webkit-search-results-decoration {
		-webkit-appearance: none !important;
	}
</style>

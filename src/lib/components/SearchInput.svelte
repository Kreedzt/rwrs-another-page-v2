<script lang="ts">
	interface Props {
		placeholder?: string;
		value?: string;
		search: (query: string) => void;
	}

	let { placeholder, value, search }: Props = $props();

	// Set default values
	placeholder = placeholder ?? 'Search...';
	value = value ?? '';

	// Handle input changes
	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;
		search(value);
	}
</script>

<div class="form-control flex-1">
	<label class="input input-bordered w-full focus-within:outline-none">
		<svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
			<g
				stroke-linejoin="round"
				stroke-linecap="round"
				stroke-width="2.5"
				fill="none"
				stroke="currentColor"
			>
				<circle cx="11" cy="11" r="8"></circle>
				<path d="m21 21-4.3-4.3"></path>
			</g>
		</svg>
		<input type="search" {placeholder} class="grow focus:outline-none" {value} oninput={handleInput} />
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
	input[type="search"]:focus {
		outline: none !important;
		box-shadow: none !important;
		border: none !important;
		-webkit-appearance: none !important;
		-moz-appearance: none !important;
		appearance: none !important;
	}

	/* 移除 WebKit 浏览器的默认样式 */
	input[type="search"]::-webkit-search-decoration,
	input[type="search"]::-webkit-search-cancel-button,
	input[type="search"]::-webkit-search-results-button,
	input[type="search"]::-webkit-search-results-decoration {
		-webkit-appearance: none !important;
	}
</style>



<script lang="ts">
	interface Props {
		placeholder?: string;
		value?: string;
		search: (query: string) => void;
	}

	let { placeholder = 'Search...', value = '', search }: Props = $props();

	// Handle input changes
	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;
		search(value);
	}
</script>

<div class="form-control flex-1">
	<label class="input w-full">
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
		<input type="search" {placeholder} class="grow" {value} oninput={handleInput} />
	</label>
</div>

<style>
	.input {
		/*outline: none;*/
		/*border: 0;*/
	}

	.input:focus {
		/*border: 0;*/
		/*outline: none;*/
	}
</style>

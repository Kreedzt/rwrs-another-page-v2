<script lang="ts">
	import type { PlayerDatabase } from '$lib/models/player.model';
	import TranslatedText from '$lib/components/TranslatedText.svelte';

	interface Props {
		currentDb: PlayerDatabase;
		onDbChange: (db: PlayerDatabase) => void;
	}

	let { currentDb, onDbChange }: Props = $props();

	const databases: { value: PlayerDatabase; label: string; i18n: string }[] = [
		{ value: 'invasion', label: 'Invasion', i18n: 'app.player.database.invasion' },
		{ value: 'pacific', label: 'Pacific', i18n: 'app.player.database.pacific' },
		{
			value: 'prereset_invasion',
			label: 'Invasion (before reset)',
			i18n: 'app.player.database.prereset_invasion'
		}
	];
</script>

<select
	class="select select-bordered w-full min-w-48 sm:w-auto"
	bind:value={currentDb}
	onchange={(e) => onDbChange(e.target.value as PlayerDatabase)}
	aria-label="Select player database"
	title="Select player database"
>
	{#each databases as db (db.value)}
		<option value={db.value}>
			<TranslatedText key={db.i18n} />
		</option>
	{/each}
</select>

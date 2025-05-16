<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
	import TranslatedText from '$lib/components/TranslatedText.svelte';
</script>

<div class="container mx-auto p-4 max-w-5xl">
	<h1 class="text-2xl font-bold mb-4">{m["app.title"]()}</h1>

	<div class="mb-6">
		<h2 class="text-xl font-semibold mb-2">Language Switcher</h2>
		<LanguageSwitcher buttonClass="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" />

		<div class="mt-4">
			<h3 class="text-lg font-medium mb-2">Compact Version</h3>
			<LanguageSwitcher compact={true} />
		</div>
	</div>

	<div class="mb-6">
		<h2 class="text-xl font-semibold mb-2">Search Example</h2>
		<div class="relative">
			<input
				type="text"
				placeholder={m["app.search.placeholder"]()}
				class="w-full p-2 border rounded"
			/>
			<button class="absolute right-2 top-2">{m["app.button.reset"]()}</button>
		</div>
	</div>

	<div class="mb-6">
		<h2 class="text-xl font-semibold mb-2">Stats with Variables</h2>
		<div class="flex flex-col gap-2">
			<p>{m["app.stats.servers"]({ filtered: 25, total: 100 })}</p>
			<p>{m["app.stats.players"]({ filtered: 150, total: 500 })}</p>
		</div>
	</div>

	<div class="mb-6">
		<h2 class="text-xl font-semibold mb-2">Quick Filters</h2>
		<div class="flex flex-wrap gap-2">
			<button class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
				{m["app.filter.officialInvasion"]()}
			</button>
			<button class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
				{m["app.filter.officialWW2Invasion"]()}
			</button>
			<button class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
				{m["app.filter.officialDominance"]()}
			</button>
		</div>
	</div>

	<div class="mb-6">
		<h2 class="text-xl font-semibold mb-2">Table Columns</h2>
		<div class="overflow-x-auto">
			<table class="min-w-full border">
				<thead>
					<tr class="bg-gray-100">
						<th class="p-2 border">{m["app.column.name"]()}</th>
						<th class="p-2 border">{m["app.column.map"]()}</th>
						<th class="p-2 border">{m["app.column.players"]()}</th>
						<th class="p-2 border">{m["app.column.country"]()}</th>
						<th class="p-2 border">{m["app.column.action"]()}</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td class="p-2 border">Server 1</td>
						<td class="p-2 border">Map A</td>
						<td class="p-2 border">24/32</td>
						<td class="p-2 border">US</td>
						<td class="p-2 border">
							<button class="px-2 py-1 bg-green-500 text-white rounded text-sm">
								{m["app.button.join"]()}
							</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>

	<div class="mb-6">
		<h2 class="text-xl font-semibold mb-2">Toast Messages</h2>
		<div class="flex flex-col gap-2">
			<div class="p-3 bg-blue-100 border-l-4 border-blue-500">
				<p class="font-bold">{m["app.toast.refreshing.title"]()}</p>
				<p>{m["app.toast.refreshing.description"]()}</p>
			</div>
			<div class="p-3 bg-green-100 border-l-4 border-green-500">
				<p class="font-bold">{m["app.toast.refreshSuccess.title"]()}</p>
				<p>{m["app.toast.refreshSuccess.description"]({ time: "2023-10-15 14:30", count: 42 })}</p>
			</div>
		</div>
	</div>

	<div class="mb-6">
		<h2 class="text-xl font-semibold mb-2">Help Guide</h2>
		<div class="p-4 bg-gray-100 rounded">
			<h3 class="font-bold">{m["app.guide.searchInput.title"]()}</h3>
			<p>{m["app.guide.searchInput.description"]()}</p>
		</div>
	</div>

	<div class="mb-6">
		<h2 class="text-xl font-semibold mb-2">TranslatedText Component</h2>
		<div class="p-4 bg-gray-100 rounded space-y-4">
			<div>
				<h3 class="font-medium mb-1">Basic Usage:</h3>
				<TranslatedText key="app.button.refresh" className="badge badge-neutral" />
				<TranslatedText key="app.button.reset" className="badge badge-primary ml-2" />
			</div>

			<div>
				<h3 class="font-medium mb-1">With Parameters:</h3>
				<TranslatedText
					key="app.stats.servers"
					params={{ filtered: 42, total: 100 }}
					className="block"
				/>
				<TranslatedText
					key="app.toast.refreshSuccess.description"
					params={{ time: "2023-10-15 14:30", count: 42 }}
					className="block text-sm text-gray-600"
				/>
			</div>

			<div>
				<h3 class="font-medium mb-1">Different HTML Tags:</h3>
				<TranslatedText key="app.title" tag="h3" className="text-lg font-bold" />
				<TranslatedText key="app.loading" tag="div" className="italic text-gray-500" />
			</div>

			<div>
				<h3 class="font-medium mb-1">Error Handling:</h3>
				<TranslatedText key="non.existent.key" className="badge" />
			</div>
		</div>
	</div>

	<p class="text-sm text-gray-600 mt-8">
		If you use VSCode, install the <a
			href="https://marketplace.visualstudio.com/items?itemName=inlang.vs-code-extension"
			class="text-blue-500 hover:underline"
			target="_blank">Sherlock i18n extension</a
		> for a better i18n experience.
	</p>
</div>

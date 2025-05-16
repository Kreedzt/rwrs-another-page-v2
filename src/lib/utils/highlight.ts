/**
 * Highlights matching text in a string with HTML markup
 * @param text The text to search within
 * @param query The search query to highlight
 * @param className Optional CSS class name to apply to the highlight (default: "bg-accent text-accent-content")
 * @returns String with HTML markup for highlighting
 */
export function highlightMatch(
	text: string,
	query: string,
	className: string = 'bg-accent text-accent-content'
): string {
	if (!query || !text) return text;

	// Escape special regex characters in the query
	const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const regex = new RegExp(`(${escapedQuery})`, 'gi');

	// Replace matches with marked text
	return text.replace(regex, `<mark class="${className}">$1</mark>`);
}

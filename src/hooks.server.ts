import type { Handle, RequestEvent } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

export const handle: Handle = handleParaglide;

// Handle 404 errors during prerendering gracefully
// Some assets like OG images may not exist during build
export function handleHttpError({ error, event }: { error: Error; event: RequestEvent }) {
	// Ignore 404 errors for specific assets during prerendering
	if (error.message.includes('404')) {
		const url = new URL(event.request.url);
		const pathname = url.pathname;

		// Allow missing OG images, favicons, and other static assets
		if (
			pathname.includes('og-image') ||
			pathname.includes('favicon') ||
			pathname.includes('apple-icon') ||
			pathname.includes('apple-splash') ||
			pathname.endsWith('.png') ||
			pathname.endsWith('.jpg') ||
			pathname.endsWith('.webp')
		) {
			return new Response(null, { status: 200 });
		}
	}

	// For other errors, return the default error response
	return new Response(null, { status: 500 });
}

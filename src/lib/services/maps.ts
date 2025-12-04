import { request } from '$lib/request';

export interface MapData {
	name: string;
	path: string;
	image: string;
}

export async function getMaps(): Promise<MapData[]> {
	try {
		return await request<MapData[]>('/api/maps');
	} catch (error) {
		console.error('Failed to fetch maps:', error);
		return []; // Return empty array on error to prevent app crashes
	}
}
import { refreshCases } from '$lib/cache.js';
import { json } from '@sveltejs/kit';

export const POST = async () => {
	const cases = await refreshCases();
	return json({ count: cases.length });
};

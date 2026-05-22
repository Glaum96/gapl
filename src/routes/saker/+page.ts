import { getCases } from '$lib/cache.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const cases = await getCases();
	return { cases };
};

import { getCases } from '$lib/cache.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const cases = await getCases();
	return { cases };
};

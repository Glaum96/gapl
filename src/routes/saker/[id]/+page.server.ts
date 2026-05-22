import { getCases } from '$lib/cache.js';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const cases = await getCases();
	const c = cases.find((x) => x.einnsynId === decodeURIComponent(params.id));
	if (!c) error(404, 'Sak ikke funnet');
	return { case: c };
};

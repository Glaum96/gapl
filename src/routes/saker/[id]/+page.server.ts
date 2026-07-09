import { getCases } from '$lib/cache.js';
import { getProposalsForCase } from '$lib/interactions.js';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const cases = await getCases();
	const c = cases.find((x) => x.einnsynId === decodeURIComponent(params.id));
	if (!c) error(404, 'Sak ikke funnet');

	const userId = locals.user?.email ?? null;
	const proposals = await getProposalsForCase(c.einnsynId, userId);

	return { case: c, proposals, user: locals.user ?? null };
};

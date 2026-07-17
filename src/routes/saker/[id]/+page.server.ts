import { getCases } from '$lib/cache.js';
import { fetchCaseById } from '$lib/einnsyn.js';
import { getProposalsForCase } from '$lib/interactions.js';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const id = decodeURIComponent(params.id);
	const cases = await getCases();
	let c = cases.find((x) => x.einnsynId === id);
	if (!c) {
		c = await fetchCaseById(id) ?? undefined;
	}
	if (!c) error(404, 'Sak ikke funnet');

	const userId = locals.user?.email ?? null;
	const proposals = await getProposalsForCase(c.einnsynId, userId);

	return { case: c, proposals, user: locals.user ?? null };
};

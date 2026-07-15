import { error } from '@sveltejs/kit';
import { getMeetings, getCases } from '$lib/cache.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const [meetings, cases] = await Promise.all([getMeetings(), getCases()]);

	const meeting = meetings.find((m) => m.einnsynId === params.id);
	if (!meeting) error(404, 'Møte ikke funnet');

	const caseMap = new Map(cases.map((c) => [c.einnsynId, c]));
	const moetesaker = meeting.moetesakIds
		.map((id) => caseMap.get(id))
		.filter((c): c is NonNullable<typeof c> => c !== undefined);

	return { meeting, moetesaker };
};

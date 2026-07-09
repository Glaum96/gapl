import { json, error } from '@sveltejs/kit';
import { castVote } from '$lib/interactions.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, params, locals }) => {
	if (!locals.user) error(401, 'Ikke innlogget');

	const { vote, caseId } = await request.json();
	if (vote !== 1 && vote !== -1) error(400, 'Ugyldig stemme');

	await castVote(params.id, caseId, locals.user.email, vote);
	return json({ ok: true });
};

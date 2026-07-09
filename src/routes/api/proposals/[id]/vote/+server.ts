import { json, error } from '@sveltejs/kit';
import { castVote, getProposalById } from '$lib/interactions.js';
import { notifyAdminsNewVote } from '$lib/mailer.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, params, locals }) => {
	if (!locals.user) error(401, 'Ikke innlogget');

	const { vote, caseId } = await request.json();
	if (vote !== 1 && vote !== -1) error(400, 'Ugyldig stemme');

	const [, proposal] = await Promise.all([
		castVote(params.id, caseId, locals.user.email, vote),
		getProposalById(params.id)
	]);

	if (proposal) {
		notifyAdminsNewVote({
			userName: locals.user.name,
			caseId,
			proposalText: proposal.text,
			vote
		}).catch((err) => console.error('Admin-varsel feilet:', err));
	}

	return json({ ok: true });
};

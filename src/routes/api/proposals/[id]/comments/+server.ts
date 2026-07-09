import { json, error } from '@sveltejs/kit';
import { addComment, getProposalById } from '$lib/interactions.js';
import { notifyAdminsNewComment } from '$lib/mailer.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, params, locals }) => {
	if (!locals.user) error(401, 'Ikke innlogget');

	const { caseId, text } = await request.json();
	if (!text?.trim()) error(400, 'Mangler tekst');
	if (text.trim().length > 500) error(400, 'Kommentar kan ikke være lengre enn 500 tegn');

	const [comment, proposal] = await Promise.all([
		addComment(params.id, caseId, locals.user.email, locals.user.name, text),
		getProposalById(params.id)
	]);

	if (proposal) {
		notifyAdminsNewComment({
			userName: locals.user.name,
			caseId,
			proposalText: proposal.text,
			commentText: text.trim()
		}).catch((err) => console.error('Admin-varsel feilet:', err));
	}

	return json({ comment });
};

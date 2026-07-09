import { json, error } from '@sveltejs/kit';
import { addProposal } from '$lib/interactions.js';
import { notifyAdminsNewProposal } from '$lib/mailer.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) error(401, 'Ikke innlogget');

	const { caseId, text } = await request.json();
	if (!caseId || !text?.trim()) error(400, 'Mangler caseId eller tekst');
	if (text.trim().length > 1000) error(400, 'Forslag kan ikke være lengre enn 1000 tegn');

	const proposal = await addProposal(caseId, locals.user.email, locals.user.name, text);

	notifyAdminsNewProposal({
		userName: locals.user.name,
		caseId,
		text: text.trim()
	}).catch((err) => console.error('Admin-varsel feilet:', err));

	return json({ proposal });
};

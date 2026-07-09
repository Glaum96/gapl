import { json, error } from '@sveltejs/kit';
import { addComment } from '$lib/interactions.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, params, locals }) => {
	if (!locals.user) error(401, 'Ikke innlogget');

	const { caseId, text } = await request.json();
	if (!text?.trim()) error(400, 'Mangler tekst');
	if (text.trim().length > 500) error(400, 'Kommentar kan ikke være lengre enn 500 tegn');

	const comment = await addComment(params.id, caseId, locals.user.email, locals.user.name, text);
	return json({ comment });
};

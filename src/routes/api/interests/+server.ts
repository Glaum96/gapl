import { json, error } from '@sveltejs/kit';
import { updateInterests } from '$lib/auth.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) error(401, 'Ikke innlogget');

	const { interests } = await request.json();
	if (!Array.isArray(interests)) error(400, 'Ugyldig data');

	await updateInterests(locals.user.email, interests);
	return json({ ok: true });
};

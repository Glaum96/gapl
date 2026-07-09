import type { Handle } from '@sveltejs/kit';
import { getSessionUser } from '$lib/auth.js';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('session');
	if (token) {
		const user = await getSessionUser(token);
		if (user) {
			event.locals.user = {
				email: user.email,
				name: user.name,
				interests: user.interests
			};
		}
	}
	return resolve(event);
};

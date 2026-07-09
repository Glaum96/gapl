import { fail, redirect } from '@sveltejs/kit';
import { createUser, createSession } from '$lib/auth.js';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = String(data.get('email') ?? '').trim();
		const password = String(data.get('password') ?? '');
		const name = String(data.get('name') ?? '').trim();

		if (!email || !password || !name) {
			return fail(400, { error: 'Alle felt må fylles ut' });
		}
		if (password.length < 8) {
			return fail(400, { error: 'Passord må være minst 8 tegn' });
		}

		try {
			const user = await createUser(email, password, name);
			const token = await createSession(user.email);
			cookies.set('session', token, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				maxAge: 30 * 24 * 60 * 60
			});
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : 'Noe gikk galt';
			return fail(400, { error: message });
		}

		redirect(303, '/saker');
	}
};

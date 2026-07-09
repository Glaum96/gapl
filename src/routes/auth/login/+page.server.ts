import { fail, redirect } from '@sveltejs/kit';
import { verifyUser, createSession } from '$lib/auth.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(303, '/saker');
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = String(data.get('email') ?? '').trim();
		const password = String(data.get('password') ?? '');

		if (!email || !password) {
			return fail(400, { error: 'Fyll ut e-post og passord' });
		}

		const user = await verifyUser(email, password);
		if (!user) {
			return fail(401, { error: 'Feil e-post eller passord' });
		}

		const token = await createSession(String(user._id ?? user.email));
		cookies.set('session', token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 30 * 24 * 60 * 60
		});

		redirect(303, '/saker');
	}
};

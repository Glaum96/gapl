import { error } from '@sveltejs/kit';
import { getAllUsers } from '$lib/auth.js';
import { getProposalsCollection, getVotesCollection } from '$lib/db.js';
import type { PageServerLoad } from './$types';
import type { Proposal } from '$lib/interactions.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user?.role !== 'admin') error(403, 'Ikke tilgang');

	const [users, proposals, voteCount] = await Promise.all([
		getAllUsers(),
		getProposalsCollection().then((col) =>
			col.find<Proposal>({}).sort({ createdAt: -1 }).toArray().then((docs) =>
				docs.map(({ _id, ...p }) => ({ id: String(_id), ...p }))
			)
		),
		getVotesCollection().then((col) => col.countDocuments())
	]);

	return {
		stats: {
			users: users.length,
			proposals: proposals.length,
			votes: voteCount
		},
		users: users.map(({ _id, ...u }) => ({ id: String(_id), ...u })),
		proposals
	};
};

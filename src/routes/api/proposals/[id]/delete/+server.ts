import { json, error } from '@sveltejs/kit';
import { getProposalsCollection, getVotesCollection, getCommentsCollection } from '$lib/db.js';
import { ObjectId } from 'mongodb';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) error(401, 'Ikke innlogget');

	let oid: ObjectId;
	try { oid = new ObjectId(params.id); } catch { error(400, 'Ugyldig id'); }

	const col = await getProposalsCollection();
	const proposal = await col.findOne({ _id: oid });
	if (!proposal) error(404, 'Ikke funnet');
	if (proposal.userId !== locals.user.email && locals.user.role !== 'admin') {
		error(403, 'Ikke tilgang');
	}

	await Promise.all([
		col.deleteOne({ _id: oid }),
		getVotesCollection().then((c) => c.deleteMany({ proposalId: params.id })),
		getCommentsCollection().then((c) => c.deleteMany({ proposalId: params.id }))
	]);

	return json({ ok: true });
};

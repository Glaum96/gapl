import { json, error } from '@sveltejs/kit';
import { getProposalsCollection, getVotesCollection, getCommentsCollection } from '$lib/db.js';
import { ObjectId } from 'mongodb';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (locals.user?.role !== 'admin') error(403, 'Ikke tilgang');

	const { id } = await request.json();
	if (!id) error(400, 'Mangler id');

	let oid: ObjectId;
	try {
		oid = new ObjectId(id);
	} catch {
		error(400, 'Ugyldig id');
	}

	await Promise.all([
		getProposalsCollection().then((col) => col.deleteOne({ _id: oid })),
		getVotesCollection().then((col) => col.deleteMany({ proposalId: id })),
		getCommentsCollection().then((col) => col.deleteMany({ proposalId: id }))
	]);

	return json({ ok: true });
};

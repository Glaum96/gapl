import { json, error } from '@sveltejs/kit';
import { getCommentsCollection } from '$lib/db.js';
import { ObjectId } from 'mongodb';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) error(401, 'Ikke innlogget');

	let oid: ObjectId;
	try { oid = new ObjectId(params.id); } catch { error(400, 'Ugyldig id'); }

	const col = await getCommentsCollection();
	const comment = await col.findOne({ _id: oid });
	if (!comment) error(404, 'Ikke funnet');
	if (comment.userId !== locals.user.email && locals.user.role !== 'admin') {
		error(403, 'Ikke tilgang');
	}

	await col.deleteOne({ _id: oid });
	return json({ ok: true });
};

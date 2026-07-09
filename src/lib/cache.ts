import { fetchCases, type Case } from './einnsyn.js';
import { getCasesCollection, getUsersCollection } from './db.js';
import { sendCategoryAlerts } from './mailer.js';
import type { ObjectId } from 'mongodb';

const TTL_MS = 24 * 60 * 60 * 1000;

interface CaseDoc extends Case {
	_id?: ObjectId;
	cachedAt: number;
}

export async function getCases(): Promise<Case[]> {
	const col = await getCasesCollection();
	const first = await col.findOne<CaseDoc>({});
	if (first && Date.now() - first.cachedAt < TTL_MS) {
		const docs = await col.find<CaseDoc>({}).toArray();
		return docs.map(({ cachedAt: _, _id: __, ...c }) => c as Case);
	}
	return refreshCases();
}

export async function refreshCases(): Promise<Case[]> {
	const col = await getCasesCollection();

	// Hent eksisterende IDs for å finne nye saker
	const existing = await col.find<CaseDoc>({}, { projection: { einnsynId: 1 } }).toArray();
	const existingIds = new Set(existing.map((d) => d.einnsynId));

	const cases = await fetchCases();
	const cachedAt = Date.now();
	await col.deleteMany({});
	if (cases.length) {
		await col.insertMany(cases.map((c) => ({ ...c, cachedAt })));
	}

	// Varsle brukere om nye saker (fire-and-forget, blokkerer ikke response)
	const newCases = cases.filter((c) => !existingIds.has(c.einnsynId));
	if (newCases.length) {
		getUsersCollection()
			.then((users) =>
				users
					.find<{ email: string; name: string; interests: string[] }>(
						{ interests: { $exists: true, $not: { $size: 0 } } },
						{ projection: { email: 1, name: 1, interests: 1 } }
					)
					.toArray()
			)
			.then((subscribers) => sendCategoryAlerts(newCases, subscribers))
			.catch((err) => console.error('Varsel-sending feilet:', err));
	}

	return cases;
}

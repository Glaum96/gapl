import { fetchCases, type Case } from './einnsyn.js';
import { getCasesCollection } from './db.js';

const TTL_MS = 24 * 60 * 60 * 1000;

interface CaseDoc extends Case {
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
	const cases = await fetchCases();
	const cachedAt = Date.now();
	await col.deleteMany({});
	if (cases.length) {
		await col.insertMany(cases.map((c) => ({ ...c, cachedAt })));
	}
	return cases;
}

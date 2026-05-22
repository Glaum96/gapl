import { fetchCases, type Case } from './einnsyn.js';

const TTL_MS = 60 * 60 * 1000; // 60 min

let cache: { cases: Case[]; fetchedAt: number } | null = null;

export async function getCases(): Promise<Case[]> {
	if (cache && Date.now() - cache.fetchedAt < TTL_MS) {
		return cache.cases;
	}
	const cases = await fetchCases();
	cache = { cases, fetchedAt: Date.now() };
	return cases;
}

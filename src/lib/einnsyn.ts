import { categorize } from './categories.js';

const EINNSYN_API = 'https://api.einnsyn.no';
const EINNSYN_WEB = 'https://einnsyn.no';
const SEARCH_QUERY = 'GrünerLøkka bydelsutvalg';

export interface Case {
	einnsynId: string;
	title: string;
	entityType: string;
	documentType: string;
	publishedAt: string | null;
	einnsynUrl: string;
	categories: string[];
}

function detectDocType(title: string, jpType: string, entity: string): string {
	const t = title.toLowerCase();
	if (t.includes('tilleggsinnkalling')) return 'tilleggsinnkalling';
	if (t.includes('innkalling')) return 'innkalling';
	if (t.includes('protokoll')) return 'protokoll';
	if (t.includes('sakskart') || jpType === 'sakskart') return 'sakskart';
	if (entity === 'Moetesak' || entity === 'Moetemappe') return 'moetesak';
	return 'annet';
}


interface RawItem {
	id: string;
	entity?: string;
	offentligTittel?: string;
	journalposttype?: string;
	publisertDato?: string;
	slug?: string;
}

function buildEinnsynUrlFromSlug(entity: string, slug: string): string {
	if (entity === 'Moetesak') return `${EINNSYN_WEB}/moetesak/${slug}`;
	if (entity === 'Moetemappe') return `${EINNSYN_WEB}/moetemappe/${slug}`;
	return `${EINNSYN_WEB}/journalpost/${slug}`;
}

async function normalizeItems(items: RawItem[]): Promise<Case[]> {
	return items.map((item) => {
		const einnsynId = item.id ?? '';
		const entity = item.entity ?? 'Journalpost';
		const title = item.offentligTittel ?? 'Uten tittel';
		const docType = detectDocType(title, item.journalposttype ?? '', entity);
		const publishedAt = item.publisertDato ?? null;
		const slug = item.slug ?? '';

		const einnsynUrl = slug
			? buildEinnsynUrlFromSlug(entity, slug)
			: `${EINNSYN_WEB}/`;

		return {
			einnsynId,
			title,
			entityType: entity,
			documentType: docType,
			publishedAt,
			einnsynUrl,
			categories: categorize(title)
		};
	});
}

async function fetchPage(cursors: string[] = []): Promise<{ items: RawItem[]; nextCursors: string[] | null }> {
	const params = new URLSearchParams();
	params.append('query', SEARCH_QUERY);
	params.append('limit', '25');
	for (const c of cursors) params.append('startingAfter', c);

	const resp = await fetch(`${EINNSYN_API}/search?${params}`);
	if (!resp.ok) return { items: [], nextCursors: null };

	const data = await resp.json();

	let nextCursors: string[] | null = null;
	if (data.next) {
		try {
			const url = new URL(data.next.startsWith('http') ? data.next : `http://x${data.next}`);
			const vals = url.searchParams.getAll('startingAfter');
			if (vals.length) nextCursors = vals;
		} catch {
			// ignore
		}
	}

	return { items: data.items ?? [], nextCursors };
}

export interface Meeting {
	einnsynId: string;
	title: string;
	meetingDate: string | null;
	location: string | null;
	moetesakIds: string[];
}

export async function fetchMeetings(): Promise<Meeting[]> {
	const params = new URLSearchParams();
	params.append('query', SEARCH_QUERY);
	params.append('entity', 'Moetemappe');
	params.append('limit', '10');

	const resp = await fetch(`${EINNSYN_API}/search?${params}`);
	if (!resp.ok) return [];
	const data = await resp.json();

	return (data.items ?? []).map((item: Record<string, unknown>) => ({
		einnsynId: String(item.id ?? ''),
		title: String(item.offentligTittel ?? 'Uten tittel'),
		meetingDate: item.moetedato ? String(item.moetedato) : null,
		location: item.moetested ? String(item.moetested) : null,
		moetesakIds: Array.isArray(item.moetesak) ? item.moetesak.map(String) : []
	}));
}

export async function fetchCases(maxPages = 5): Promise<Case[]> {
	const allRaw: RawItem[] = [];
	let cursors: string[] = [];

	for (let i = 0; i < maxPages; i++) {
		const { items, nextCursors } = await fetchPage(cursors);
		if (!items.length) break;
		allRaw.push(...items);
		if (!nextCursors) break;
		cursors = nextCursors;
	}

	return normalizeItems(allRaw);
}

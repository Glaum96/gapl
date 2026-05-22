export const CATEGORIES: Record<string, { label: string; keywords: string[] }> = {
	trafikk: {
		label: 'Trafikk og transport',
		keywords: ['trafikk', 'transport', 'sykkel', 'buss', 'vei', 'parkering', 'kollektiv', 't-bane', 'trikk']
	},
	skole: {
		label: 'Skole og barnehage',
		keywords: ['skole', 'barnehage', 'utdanning', 'elev', 'sfo', 'ungdomsskole', 'barneskole']
	},
	bolig: {
		label: 'Bolig og utbygging',
		keywords: ['bolig', 'utbygging', 'regulering', 'leilighet', 'eiendom', 'byggeplan', 'tomte']
	},
	kultur: {
		label: 'Kultur og idrett',
		keywords: ['kultur', 'idrett', 'bibliotek', 'konsert', 'festival', 'teater', 'museum', 'frivillighet']
	},
	naring: {
		label: 'Næringsliv',
		keywords: ['næring', 'butikk', 'restaurant', 'handel', 'bedrift', 'næringsliv', 'serveringsted']
	},
	helse: {
		label: 'Helse og omsorg',
		keywords: ['helse', 'omsorg', 'sykehjem', 'psykisk', 'rus', 'legesenter', 'tjenester']
	},
	miljo: {
		label: 'Miljø og klima',
		keywords: ['miljø', 'klima', 'grønn', 'avfall', 'forurensning', 'bærekraft', 'energi', 'utslipp']
	},
	byrom: {
		label: 'Byrom og parker',
		keywords: ['park', 'byrom', 'torg', 'grøntareal', 'lekeplass', 'friluft', 'gang', 'fortau']
	},
	okonomi: {
		label: 'Økonomi og budsjett',
		keywords: ['økonomi', 'budsjett', 'regnskap', 'avgift', 'skatt', 'tilskudd', 'bevilgning']
	}
};

export function categorize(title: string): string[] {
	const lower = title.toLowerCase();
	return Object.entries(CATEGORIES)
		.filter(([, { keywords }]) => keywords.some((kw) => lower.includes(kw)))
		.map(([key]) => key);
}

export function categoryLabel(key: string): string {
	return CATEGORIES[key]?.label ?? key;
}

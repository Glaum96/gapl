export interface Event {
	date: string;
	title: string;
	subtitle?: string;
	description?: string;
	practical?: string;
	facebookUrl?: string;
}

export const EVENTS: Event[] = [
	{
		date: '13. mai 2026',
		title: 'Politisk Pub',
		subtitle: 'Gutta — den nye likestillingskampen',
		description:
			'Sakker gutta etter i likestillingskampen? Tar vi guttas utfordringer på alvor? Forfatter av boka <em>«Gutta — den nye likestillingskampen»</em>, Synnøve Vereide Trampe, møter AUF-nestleder Nimrah Ramzan til diskusjon. Ordstyrer: Haakon Gunleiksrud fra Grünerløkka Arbeiderpartilag.',
		practical:
			'Programstart kl. 18:00. Aldersgrense 18 år. Shamrock er åpent fra 15:00 – mat, snacks og drikke. Møtet er åpent og gratis for alle. Spørsmål? Ring Trine Vollan på 415 62 062.',
		facebookUrl: 'https://www.facebook.com/events/1626483028581213/'
	},
	{
		date: '27. mai 2026',
		title: 'Sosialdemokratisk Bokklubb',
		subtitle: 'Bokklubbmøte',
		description:
			'Vi samles for å diskutere fagbøker og politisk litteratur fra et sosialdemokratisk perspektiv. En koselig arena for å fordype seg i ideer som former politikken vår.',
		practical:
			'Programstart kl. 18:00. Shamrock er åpent fra 15:00 – mat, snacks og drikke. Møtet er åpent og gratis for alle.',
		facebookUrl: 'https://www.facebook.com/events/4489674294689862/'
	},
	{ date: '10. juni 2026', title: 'Sosialt Samvær' },
	// Sommerpause — oppstart igjen 27. august
	{ date: '27. august 2026', title: 'Politisk Pub' },
	{ date: '3. september 2026', title: 'Sosialdemokratisk Bokklubb' },
	{ date: '10. september 2026', title: 'TBD' },
	{ date: '17. september 2026', title: 'Sinsen & Carl-Berner-arrangement' },
	{ date: '24. september 2026', title: 'Politisk Pub' },
	{ date: '1. oktober 2026', title: 'Sosialdemokratisk Bokklubb' },
	{ date: '8. oktober 2026', title: 'TBD' },
	{ date: '15. oktober 2026', title: 'Sinsen & Carl-Berner-arrangement' },
	{ date: '22. oktober 2026', title: 'Politisk Pub' },
	{ date: '29. oktober 2026', title: 'Sosialdemokratisk Bokklubb' },
	{ date: '5. november 2026', title: 'TBD' },
	{ date: '12. november 2026', title: 'Sinsen & Carl-Berner-arrangement' }
];

const MONTH_MAP: Record<string, number> = {
	januar: 0, februar: 1, mars: 2, april: 3, mai: 4, juni: 5,
	juli: 6, august: 7, september: 8, oktober: 9, november: 10, desember: 11
};

export function parseEventDate(str: string): Date {
	const [day, month, year] = str.toLowerCase().split(' ');
	return new Date(parseInt(year), MONTH_MAP[month], parseInt(day));
}

export function nextEvent(): Event | null {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	return EVENTS.find((e) => parseEventDate(e.date) >= today) ?? null;
}

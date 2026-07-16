import { getCases, getMeetings } from '$lib/cache.js';
import { EVENTS, parseEventDate, nextEvent } from '$lib/events.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [cases, allMeetings] = await Promise.all([getCases(), getMeetings()]);

	const now = new Date();

	// Neste BU-møte
	const nextMeeting = allMeetings
		.filter((m) => m.meetingDate && new Date(m.meetingDate) >= now)
		.sort((a, b) => (a.meetingDate ?? '').localeCompare(b.meetingDate ?? ''))[0] ?? null;

	// Saker fra neste BU-møte
	const nextMeetingSaker = nextMeeting
		? (() => {
				const caseMap = new Map(cases.map((c) => [c.einnsynId, c]));
				return nextMeeting.moetesakIds
					.map((id) => caseMap.get(id))
					.filter((c): c is NonNullable<typeof c> => c !== undefined)
					.slice(0, 6);
			})()
		: [];

	// Nyeste møtesaker generelt (unntatt de som allerede vises fra neste møte)
	const nextMeetingSakerIds = new Set(nextMeetingSaker.map((c) => c.einnsynId));
	const recentMoetesaker = cases
		.filter((c) => c.documentType === 'moetesak' && !nextMeetingSakerIds.has(c.einnsynId))
		.sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))
		.slice(0, 4);

	// Kommende BU-møter (for høyre kolonne)
	const upcomingMeetings = allMeetings
		.filter((m) => m.meetingDate && new Date(m.meetingDate) >= now)
		.sort((a, b) => (a.meetingDate ?? '').localeCompare(b.meetingDate ?? ''))
		.slice(0, 3);

	// Aktivitetsplan: 1 passert + 3 kommende
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const pastEvents = EVENTS.filter((e) => parseEventDate(e.date) < today).slice(-1);
	const upcomingEvents = EVENTS.filter((e) => parseEventDate(e.date) >= today).slice(0, 3);
	const visibleEvents = [...pastEvents, ...upcomingEvents];

	return {
		nextEvent: nextEvent(),
		visibleEvents,
		nextMeeting,
		nextMeetingSaker,
		recentMoetesaker,
		upcomingMeetings
	};
};

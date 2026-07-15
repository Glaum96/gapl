import { getCases, getMeetings } from '$lib/cache.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [cases, allMeetings] = await Promise.all([getCases(), getMeetings()]);

	const now = new Date();
	const upcomingMeetings = allMeetings
		.filter((m) => m.meetingDate && new Date(m.meetingDate) >= now)
		.sort((a, b) => (a.meetingDate ?? '').localeCompare(b.meetingDate ?? ''))
		.slice(0, 3);

	return { cases, upcomingMeetings };
};

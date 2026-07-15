import { refreshCases, refreshMeetings } from '$lib/cache.js';
import { json } from '@sveltejs/kit';

export const POST = async () => {
	const [cases, meetings] = await Promise.all([refreshCases(), refreshMeetings()]);
	return json({ count: cases.length, meetings: meetings.length });
};

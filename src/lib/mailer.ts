import { Resend } from 'resend';
import { env } from '$env/dynamic/private';
import { categoryLabel } from './categories.js';
import { getUsersCollection } from './db.js';
import type { Case } from './einnsyn.js';

function getResend(): Resend {
	if (!env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set');
	return new Resend(env.RESEND_API_KEY);
}

const FROM = 'Grünerløkka Arbeiderpartilag <noreply@gapl.no>';

async function getAdminEmails(): Promise<string[]> {
	const col = await getUsersCollection();
	const admins = await col
		.find<{ email: string }>({ role: 'admin' }, { projection: { email: 1 } })
		.toArray();
	return admins.map((a) => a.email);
}

function emailHeader(): string {
	return `<div style="background:#560522;padding:1.25rem 2rem;margin-bottom:1.5rem">
  <h1 style="color:#fdfaf4;font-size:1.1rem;margin:0;font-weight:800;text-transform:uppercase;letter-spacing:0.02em">
    Grünerløkka Arbeiderpartilag
  </h1>
</div>`;
}

export async function notifyAdminsNewProposal(opts: {
	userName: string;
	caseId: string;
	text: string;
}): Promise<void> {
	if (!env.RESEND_API_KEY) return;
	const to = await getAdminEmails();
	if (!to.length) return;
	const caseUrl = `https://gapl.no/saker/${encodeURIComponent(opts.caseId)}`;
	await getResend().emails.send({
		from: FROM,
		to,
		subject: `Nytt innspill fra ${opts.userName}`,
		html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
  ${emailHeader()}
  <div style="padding:0 2rem 2rem">
    <p><strong>${opts.userName}</strong> har lagt inn et innspill:</p>
    <blockquote style="border-left:3px solid #560522;margin:1rem 0;padding:0.5rem 1rem;background:#fdfaf4;color:#560522">
      ${opts.text}
    </blockquote>
    <p><a href="${caseUrl}" style="color:#560522;font-weight:600">Se saken →</a></p>
  </div>
</div>`
	});
}

export async function notifyAdminsNewComment(opts: {
	userName: string;
	caseId: string;
	proposalText: string;
	commentText: string;
}): Promise<void> {
	if (!env.RESEND_API_KEY) return;
	const to = await getAdminEmails();
	if (!to.length) return;
	const caseUrl = `https://gapl.no/saker/${encodeURIComponent(opts.caseId)}`;
	await getResend().emails.send({
		from: FROM,
		to,
		subject: `Ny kommentar fra ${opts.userName}`,
		html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
  ${emailHeader()}
  <div style="padding:0 2rem 2rem">
    <p><strong>${opts.userName}</strong> har kommentert på et innspill:</p>
    <p style="font-size:0.85rem;color:#888">Innspill: <em>${opts.proposalText}</em></p>
    <blockquote style="border-left:3px solid #560522;margin:1rem 0;padding:0.5rem 1rem;background:#fdfaf4;color:#560522">
      ${opts.commentText}
    </blockquote>
    <p><a href="${caseUrl}" style="color:#560522;font-weight:600">Se saken →</a></p>
  </div>
</div>`
	});
}

export async function notifyAdminsNewVote(opts: {
	userName: string;
	caseId: string;
	proposalText: string;
	vote: 1 | -1;
}): Promise<void> {
	if (!env.RESEND_API_KEY) return;
	const to = await getAdminEmails();
	if (!to.length) return;
	const caseUrl = `https://gapl.no/saker/${encodeURIComponent(opts.caseId)}`;
	const voteLabel = opts.vote === 1 ? '👍 støttet' : '👎 stemte ned';
	await getResend().emails.send({
		from: FROM,
		to,
		subject: `${opts.userName} ${voteLabel} et innspill`,
		html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
  ${emailHeader()}
  <div style="padding:0 2rem 2rem">
    <p><strong>${opts.userName}</strong> har ${voteLabel} dette innspillet:</p>
    <blockquote style="border-left:3px solid #560522;margin:1rem 0;padding:0.5rem 1rem;background:#fdfaf4;color:#560522">
      ${opts.proposalText}
    </blockquote>
    <p><a href="${caseUrl}" style="color:#560522;font-weight:600">Se saken →</a></p>
  </div>
</div>`
	});
}

export async function sendCategoryAlerts(
	newCases: Case[],
	subscribers: Array<{ email: string; name: string; interests: string[] }>
): Promise<void> {
	if (!env.RESEND_API_KEY || !newCases.length || !subscribers.length) return;

	const resend = getResend();

	for (const user of subscribers) {
		const relevant = newCases.filter(
			(c) => user.interests.length === 0 || c.categories.some((cat) => user.interests.includes(cat))
		);
		if (!relevant.length) continue;

		const caseList = relevant
			.map((c) => {
				const cats = c.categories.map(categoryLabel).join(', ');
				const url = `https://gapl.no/saker/${encodeURIComponent(c.einnsynId)}`;
				return `<li style="margin-bottom:1rem">
  <a href="${url}" style="font-weight:600;color:#560522">${c.title}</a>
  ${cats ? `<br><span style="font-size:0.85rem;color:#888">${cats}</span>` : ''}
</li>`;
			})
			.join('');

		await resend.emails.send({
			from: FROM,
			to: user.email,
			subject: `${relevant.length} nye saker fra Grünerløkka bydelsutvalg`,
			html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
  <div style="background:#560522;padding:1.5rem 2rem;margin-bottom:2rem">
    <h1 style="color:#fdfaf4;font-size:1.4rem;margin:0;font-weight:800;text-transform:uppercase;letter-spacing:0.02em">
      Grünerløkka Arbeiderpartilag
    </h1>
  </div>

  <div style="padding:0 2rem 2rem">
    <p>Hei ${user.name},</p>
    <p>Det er ${relevant.length} nye ${relevant.length === 1 ? 'sak' : 'saker'} fra Grünerløkka bydelsutvalg som matcher dine interesser:</p>

    <ul style="padding-left:1.25rem;line-height:1.6">
      ${caseList}
    </ul>

    <p style="margin-top:2rem">
      <a href="https://gapl.no/saker" style="background:#e31c28;color:#fdfaf4;padding:0.6rem 1.25rem;text-decoration:none;font-weight:700;font-size:0.9rem">
        Se alle saker →
      </a>
    </p>

    <hr style="margin:2rem 0;border:none;border-top:1px solid #eee">
    <p style="font-size:0.8rem;color:#888">
      Du mottar denne e-posten fordi du har registrert deg på gapl.no.<br>
      Oppdater interessene dine på <a href="https://gapl.no/saker" style="color:#560522">gapl.no/saker</a>.
    </p>
  </div>
</div>`
		});
	}
}

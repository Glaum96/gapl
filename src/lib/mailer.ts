import { Resend } from 'resend';
import { env } from '$env/dynamic/private';
import { categoryLabel } from './categories.js';
import type { Case } from './einnsyn.js';

function getResend(): Resend {
	if (!env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set');
	return new Resend(env.RESEND_API_KEY);
}

const FROM = 'Grünerløkka Arbeiderpartilag <noreply@gapl.no>';

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

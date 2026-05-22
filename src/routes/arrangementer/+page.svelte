<script lang="ts">
	import { EVENTS, parseEventDate, nextEvent } from '$lib/events.js';

	const next = nextEvent();
	const today = new Date();
	today.setHours(0, 0, 0, 0);
</script>

<svelte:head>
	<title>Arrangementer | Grünerløkka Arbeiderpartilag</title>
</svelte:head>

<div class="container">
	<div class="info-stripe">
		<div class="info-item">📍 <span><strong>Shamrock Pub</strong>, Grünerløkka</span></div>
		<div class="info-item">🕕 <span>Annenhver onsdag, <strong>kl. 18:00</strong></span></div>
		<div class="info-item">📅 <span>Mai – november 2026</span></div>
	</div>

	{#if next}
		<div class="next-event-banner">
			<span class="label">Neste arrangement</span>
			<div class="event-name">{next.title}</div>
			<div class="next-event-meta">
				<div class="next-event-meta-item">
					<span class="meta-label">Dato</span>
					<span>{next.date}</span>
				</div>
				<div class="next-event-meta-item">
					<span class="meta-label">Tid</span>
					<span>18:00</span>
				</div>
				<div class="next-event-meta-item">
					<span class="meta-label">Sted</span>
					<span>Shamrock Pub</span>
				</div>
			</div>
			{#if next.description}
				<div class="next-event-description">
					{#if next.subtitle}<p class="event-participants">{next.subtitle}</p>{/if}
					<p class="event-about">{@html next.description}</p>
					{#if next.practical}<p class="event-practical">{next.practical}</p>{/if}
					{#if next.facebookUrl}
						<a class="fb-link" href={next.facebookUrl} target="_blank">Se Facebook-event →</a>
					{/if}
				</div>
			{/if}
		</div>
	{/if}

	<h2 class="section-heading">Aktivitetsplan</h2>
	<p class="section-sub">Tre aktiviteter som roterer annenhver onsdag</p>

	<div class="events-grid">
		{#each EVENTS as event, i}
			{@const past = parseEventDate(event.date) < today}
			<div class="event-card" class:past>
				<div class="card-label">Aktivitet {i + 1}</div>
				<div class="card-title">{event.title}</div>
				<div class="card-detail">Onsdag {event.date}</div>
				<div class="card-detail">Kl. 18:00 · Shamrock Pub</div>
			</div>
		{/each}
	</div>

	<div class="about-section">
		<h2 class="section-heading">Om aktivitetene</h2>
		<div class="about-grid">
			<div class="about-item">
				<h4>Politisk Pub</h4>
				<p>En avslappet arena for debatt om aktuelle politiske saker. Perfekt for å dele meninger og høre hva andre i laget tenker. Se <a href="https://www.politisk-pub.no" target="_blank">politisk-pub.no</a> for mer info.</p>
			</div>
			<div class="about-item">
				<h4>Sosialdemokratisk Bokklubb</h4>
				<p>Vi samles for å diskutere fagbøker og politisk litteratur fra et sosialdemokratisk perspektiv. For deg som liker å fordype seg i ideer som former politikken vår.</p>
			</div>
			<div class="about-item">
				<h4>Sosialt Samvær</h4>
				<p>Uformelt treff for å styrke fellesskapet og bli kjent med hverandre i en koselig setting. Alle er velkomne!</p>
			</div>
		</div>
	</div>
</div>

<style>
	.info-stripe {
		display: flex;
		gap: 3rem;
		flex-wrap: wrap;
		padding: 1.5rem 0 2.5rem;
		border-bottom: 1px solid rgba(86, 5, 34, 0.15);
		margin-bottom: 3rem;
	}

	.info-item {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-size: 0.95rem;
		color: var(--burgunder);
	}

	.info-item strong { font-weight: 600; }

	.next-event-banner {
		background: var(--rod);
		color: var(--krem);
		padding: 2.5rem;
		margin-bottom: 3rem;
	}

	.next-event-banner .label {
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		opacity: 0.85;
		display: block;
		margin-bottom: 0.5rem;
	}

	.event-name {
		font-family: 'Barlow Condensed', sans-serif;
		font-weight: 800;
		font-size: clamp(2.2rem, 5vw, 3.5rem);
		text-transform: uppercase;
		line-height: 1;
		margin-bottom: 1.5rem;
	}

	.next-event-meta {
		display: flex;
		gap: 2.5rem;
		flex-wrap: wrap;
	}

	.next-event-meta-item { font-size: 0.95rem; }

	.meta-label {
		display: block;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		opacity: 0.75;
		margin-bottom: 0.15rem;
	}

	.next-event-description {
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid rgba(253, 250, 244, 0.3);
	}

	.next-event-description p {
		font-size: 0.95rem;
		line-height: 1.6;
		opacity: 0.92;
		margin-bottom: 0.5rem;
	}

	.event-participants { font-weight: 600; margin-bottom: 1rem; }
	.event-about { margin-bottom: 1rem; }
	.event-practical { font-size: 0.88rem; opacity: 0.8 !important; margin-bottom: 1.25rem; }

	.fb-link {
		display: inline-block;
		background: var(--krem);
		color: var(--rod);
		font-weight: 600;
		font-size: 0.9rem;
		padding: 0.6rem 1.2rem;
		text-decoration: none;
		margin-top: 0.5rem;
	}

	.fb-link:hover { background: white; }

	.events-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 1px;
		background: rgba(86, 5, 34, 0.12);
		border: 1px solid rgba(86, 5, 34, 0.12);
		margin-bottom: 4rem;
	}

	.event-card {
		background: var(--krem);
		padding: 1.5rem;
		transition: background 0.15s;
	}

	.event-card:hover { background: #f5ede0; }
	.event-card.past { opacity: 0.35; }

	.about-section {
		border-top: 3px solid var(--rod);
		padding-top: 3rem;
		margin-bottom: 4rem;
	}

	.about-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 3rem;
		margin-top: 2rem;
	}

	.about-item h4 {
		font-family: 'Barlow Condensed', sans-serif;
		font-weight: 700;
		font-size: 1.2rem;
		text-transform: uppercase;
		color: var(--rod);
		margin-bottom: 0.5rem;
	}

	.about-item p {
		font-size: 0.95rem;
		line-height: 1.6;
	}

	@media (max-width: 640px) {
		.next-event-banner { padding: 1.5rem; }
		.info-stripe { gap: 1.5rem; }
	}
</style>

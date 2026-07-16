<script lang="ts">
	import { parseEventDate } from '$lib/events.js';
	import { categoryLabel } from '$lib/categories.js';

	let { data } = $props();

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	function formatDate(iso: string | null): string {
		if (!iso) return '';
		return new Date(iso).toLocaleDateString('nb-NO', {
			weekday: 'long', day: 'numeric', month: 'long'
		});
	}

	function formatShortDate(iso: string | null): string {
		if (!iso) return '';
		return new Date(iso).toLocaleDateString('nb-NO', {
			day: 'numeric', month: 'short', year: 'numeric'
		});
	}

	function formatEventDate(str: string): string {
		return new Date(parseEventDate(str)).toLocaleDateString('nb-NO', {
			day: 'numeric', month: 'short'
		});
	}

	function docTypeLabel(t: string): string {
		const labels: Record<string, string> = {
			moetesak: 'Møtesak',
			innkalling: 'Innkalling',
			protokoll: 'Protokoll',
			annet: 'Dokument'
		};
		return labels[t] ?? t;
	}
</script>

<svelte:head>
	<title>Grünerløkka Arbeiderpartilag</title>
</svelte:head>

<div class="container">

	<!-- Neste arrangement -->
	{#if data.nextEvent}
		<div class="next-event-banner">
			<span class="banner-label">Neste arrangement</span>
			<div class="banner-title">{data.nextEvent.title}</div>
			<div class="banner-meta">
				<div class="banner-meta-item">
					<span class="meta-label">Dato</span>
					<span>Onsdag {data.nextEvent.date}</span>
				</div>
				<div class="banner-meta-item">
					<span class="meta-label">Tid</span>
					<span>18:00</span>
				</div>
				<div class="banner-meta-item">
					<span class="meta-label">Sted</span>
					<span>Shamrock Pub</span>
				</div>
			</div>
			{#if data.nextEvent.description}
				<div class="banner-description">
					{#if data.nextEvent.subtitle}<p class="banner-subtitle">{data.nextEvent.subtitle}</p>{/if}
					<p>{@html data.nextEvent.description}</p>
					{#if data.nextEvent.practical}<p class="banner-practical">{data.nextEvent.practical}</p>{/if}
					{#if data.nextEvent.facebookUrl}
						<a class="fb-link" href={data.nextEvent.facebookUrl} target="_blank" rel="noreferrer">Se Facebook-event →</a>
					{/if}
				</div>
			{/if}
		</div>
	{/if}

	<!-- To kolonner: aktivitetsplan + BU-møter -->
	<div class="two-col">
		<div class="col-card">
			<div class="col-header">
				<h2 class="col-heading">Aktivitetsplan</h2>
				<a href="/arrangementer" class="col-link">Se alle →</a>
			</div>
			<div class="event-list">
				{#each data.visibleEvents as event}
					{@const past = parseEventDate(event.date) < today}
					<div class="event-row" class:past>
						<span class="event-title">{event.title}</span>
						<span class="event-date">Ons {formatEventDate(event.date)}</span>
					</div>
				{/each}
			</div>
		</div>

		<div class="col-card">
			<div class="col-header">
				<h2 class="col-heading">BU-møter</h2>
				<a href="/saker" class="col-link">Se alle saker →</a>
			</div>
			{#if data.upcomingMeetings.length > 0}
				<div class="meeting-list">
					{#each data.upcomingMeetings as m}
						<a href="/saker/mote/{encodeURIComponent(m.einnsynId)}" class="meeting-row">
							<span class="meeting-title">{m.title}</span>
							{#if m.meetingDate}
								<span class="meeting-date">{formatDate(m.meetingDate)}</span>
							{/if}
						</a>
					{/each}
				</div>
			{:else}
				<p class="empty-col">Ingen kommende møter registrert.</p>
			{/if}
		</div>
	</div>

	<!-- Saker fra neste BU-møte -->
	{#if data.nextMeeting && data.nextMeetingSaker.length > 0}
		<section class="saker-section">
			<div class="section-header">
				<h2 class="section-heading" style="margin-bottom:0">
					Saker til neste møte
				</h2>
				<a href="/saker/mote/{encodeURIComponent(data.nextMeeting.einnsynId)}" class="col-link">
					Se hele møtet →
				</a>
			</div>
			<p class="section-sub" style="margin-bottom:1.25rem">
				{data.nextMeeting.title}{data.nextMeeting.meetingDate ? ` · ${formatDate(data.nextMeeting.meetingDate)}` : ''}
			</p>
			<div class="saker-list">
				{#each data.nextMeetingSaker as sak}
					<a href={sak.einnsynUrl} target="_blank" rel="noreferrer" class="sak-row">
						<span class="sak-title">{sak.title}</span>
						<span class="sak-ext">eInnsyn →</span>
					</a>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Nyeste møtesaker -->
	{#if data.recentMoetesaker.length > 0}
		<section class="saker-section">
			<div class="section-header">
				<h2 class="section-heading" style="margin-bottom:0">Siste saker</h2>
				<a href="/saker" class="col-link">Se alle →</a>
			</div>
			<p class="section-sub" style="margin-bottom:1.25rem">Nyeste møtesaker fra bydelsutvalget</p>
			<div class="cards-grid">
				{#each data.recentMoetesaker as c}
					<a href="/saker/{encodeURIComponent(c.einnsynId)}" class="card">
						<div class="card-label">{docTypeLabel(c.documentType)}{c.publishedAt ? ` · ${formatShortDate(c.publishedAt)}` : ''}</div>
						<div class="card-title">{c.title}</div>
						{#if c.categories.length}
							<div class="badges">
								{#each c.categories as cat}
									<span class="badge secondary">{categoryLabel(cat)}</span>
								{/each}
							</div>
						{/if}
					</a>
				{/each}
			</div>
		</section>
	{/if}

</div>

<style>
	/* Neste arrangement-banner */
	.next-event-banner {
		background: var(--rod);
		color: var(--krem);
		padding: 2.5rem;
		margin-bottom: 2rem;
	}

	.banner-label {
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		opacity: 0.85;
		display: block;
		margin-bottom: 0.5rem;
	}

	.banner-title {
		font-family: 'Barlow Condensed', sans-serif;
		font-weight: 800;
		font-size: clamp(2.2rem, 5vw, 3.5rem);
		text-transform: uppercase;
		line-height: 1;
		margin-bottom: 1.5rem;
	}

	.banner-meta {
		display: flex;
		gap: 2.5rem;
		flex-wrap: wrap;
	}

	.banner-meta-item { font-size: 0.95rem; }

	.meta-label {
		display: block;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		opacity: 0.75;
		margin-bottom: 0.15rem;
	}

	.banner-description {
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid rgba(253, 250, 244, 0.3);
		font-size: 0.95rem;
		line-height: 1.6;
		opacity: 0.92;
	}

	.banner-subtitle { font-weight: 600; margin-bottom: 0.75rem; }
	.banner-practical { font-size: 0.88rem; opacity: 0.8; margin-top: 0.75rem; }

	.fb-link {
		display: inline-block;
		background: var(--krem);
		color: var(--rod);
		font-weight: 600;
		font-size: 0.9rem;
		padding: 0.6rem 1.2rem;
		text-decoration: none;
		margin-top: 1rem;
	}
	.fb-link:hover { background: white; }

	/* To kolonner */
	.two-col {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-bottom: 2.5rem;
	}

	@media (max-width: 640px) {
		.two-col { grid-template-columns: 1fr; }
	}

	.col-card {
		background: white;
		border: 1px solid rgba(86, 5, 34, 0.12);
		padding: 1.5rem;
	}

	.col-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid rgba(86, 5, 34, 0.08);
	}

	.col-heading {
		font-family: 'Barlow Condensed', sans-serif;
		font-size: 1.1rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--burgunder);
	}

	.col-link {
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--burgunder);
		text-decoration: none;
		opacity: 0.5;
		transition: opacity 0.15s;
	}
	.col-link:hover { opacity: 1; }

	/* Aktivitetsliste */
	.event-list {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.event-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.5rem;
		font-size: 0.88rem;
		color: var(--burgunder);
		padding: 0.3rem 0;
		border-bottom: 1px solid rgba(86, 5, 34, 0.06);
	}
	.event-row:last-child { border-bottom: none; }
	.event-row.past { opacity: 0.35; }

	.event-title { font-weight: 600; }
	.event-date { font-size: 0.78rem; opacity: 0.55; white-space: nowrap; }

	/* Møteliste */
	.meeting-list {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.meeting-row {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		padding: 0.4rem 0;
		border-bottom: 1px solid rgba(86, 5, 34, 0.06);
		text-decoration: none;
		color: var(--burgunder);
		transition: opacity 0.15s;
	}
	.meeting-row:last-child { border-bottom: none; }
	.meeting-row:hover { opacity: 0.7; }

	.meeting-title { font-size: 0.88rem; font-weight: 600; }
	.meeting-date { font-size: 0.78rem; opacity: 0.55; text-transform: capitalize; }

	.empty-col { font-size: 0.88rem; opacity: 0.45; }

	/* Saker-seksjoner */
	.saker-section {
		border-top: 2px solid rgba(86, 5, 34, 0.12);
		padding-top: 2rem;
		margin-bottom: 2.5rem;
	}

	.section-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 0.4rem;
	}

	/* Saksliste (neste møte) */
	.saker-list {
		display: flex;
		flex-direction: column;
		gap: 1px;
		background: rgba(86, 5, 34, 0.08);
		border: 1px solid rgba(86, 5, 34, 0.08);
	}

	.sak-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.75rem 1rem;
		background: white;
		text-decoration: none;
		color: var(--burgunder);
		transition: background 0.12s;
	}
	.sak-row:hover { background: rgba(86, 5, 34, 0.03); }

	.sak-title { font-size: 0.92rem; line-height: 1.4; }
	.sak-ext { font-size: 0.75rem; opacity: 0.35; white-space: nowrap; flex-shrink: 0; }
</style>

<script lang="ts">
	let { data } = $props();
	const m = $derived(data.meeting);

	function formatDate(iso: string | null): string {
		if (!iso) return '';
		return new Date(iso).toLocaleDateString('nb-NO', {
			weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
		});
	}

	function formatTime(iso: string | null): string {
		if (!iso) return '';
		return new Date(iso).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
	}
</script>

<svelte:head>
	<title>{m.title} | Grünerløkka Arbeiderpartilag</title>
</svelte:head>

<div class="container">
	<a href="/saker" class="back-link">← Tilbake til saker</a>

	<div class="meeting-header">
		<span class="badge">BU-møte</span>
		<h1 class="meeting-title">{m.title}</h1>
		<div class="meeting-meta">
			{#if m.meetingDate}
				<span>{formatDate(m.meetingDate)} kl. {formatTime(m.meetingDate)}</span>
			{/if}
			{#if m.location}
				<span class="meta-sep">·</span>
				<span>{m.location}</span>
			{/if}
		</div>
	</div>

	<section class="saker-section">
		<h2 class="section-heading" style="font-size:1.4rem; margin-bottom:1.25rem">
			Saker ({data.moetesaker.length})
		</h2>

		{#if data.moetesaker.length === 0}
			<p class="empty-state">Ingen saker funnet for dette møtet.</p>
		{:else}
			<div class="saker-list">
				{#each data.moetesaker as sak}
					<a href={sak.einnsynUrl} target="_blank" rel="noreferrer" class="sak-row">
						<span class="sak-title">{sak.title}</span>
						<span class="sak-arrow">→</span>
					</a>
				{/each}
			</div>
		{/if}
	</section>
</div>

<style>
	.back-link {
		display: inline-block;
		font-size: 0.88rem;
		font-weight: 600;
		color: var(--burgunder);
		text-decoration: none;
		opacity: 0.65;
		margin-bottom: 2rem;
		transition: opacity 0.15s;
	}
	.back-link:hover { opacity: 1; }

	.meeting-header {
		border-bottom: 3px solid var(--rod);
		padding-bottom: 2rem;
		margin-bottom: 2.5rem;
	}

	.meeting-title {
		font-family: 'Barlow Condensed', sans-serif;
		font-weight: 800;
		font-size: clamp(1.8rem, 4vw, 3rem);
		text-transform: uppercase;
		color: var(--burgunder);
		line-height: 1.05;
		margin: 0.5rem 0;
	}

	.meeting-meta {
		font-size: 0.92rem;
		color: var(--burgunder);
		opacity: 0.65;
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		align-items: center;
		text-transform: capitalize;
	}

	.meta-sep { opacity: 0.4; }

	.saker-section {
		border-top: 2px solid rgba(86, 5, 34, 0.12);
		padding-top: 2rem;
	}

	.saker-list {
		display: flex;
		flex-direction: column;
		gap: 1px;
		background: rgba(86, 5, 34, 0.1);
		border: 1px solid rgba(86, 5, 34, 0.1);
	}

	.sak-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.85rem 1rem;
		background: white;
		text-decoration: none;
		color: var(--burgunder);
		transition: background 0.12s;
	}

	.sak-row:hover {
		background: rgba(86, 5, 34, 0.04);
	}

	.sak-title {
		font-size: 0.95rem;
		line-height: 1.45;
	}

	.sak-arrow {
		font-size: 0.9rem;
		opacity: 0.35;
		flex-shrink: 0;
		transition: opacity 0.12s;
	}

	.sak-row:hover .sak-arrow { opacity: 0.8; }

	.empty-state {
		font-size: 1rem;
		color: var(--burgunder);
		opacity: 0.5;
	}
</style>

<script lang="ts">
	import { categoryLabel } from '$lib/categories.js';

	let { data } = $props();
	const c = $derived(data.case);

	function docTypeLabel(t: string): string {
		const labels: Record<string, string> = {
			innkalling: 'Innkalling',
			tilleggsinnkalling: 'Tilleggsinnkalling',
			protokoll: 'Protokoll',
			sakskart: 'Sakskart',
			moetesak: 'Møtesak',
			annet: 'Dokument'
		};
		return labels[t] ?? t;
	}

	function formatDate(iso: string | null): string {
		if (!iso) return '';
		return new Date(iso).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' });
	}
</script>

<svelte:head>
	<title>{c.title} | Grünerløkka Arbeiderpartilag</title>
</svelte:head>

<div class="container">
	<a href="/saker" class="back-link">← Tilbake til saker</a>

	<div class="case-header">
		<div class="badges" style="margin-bottom:1rem">
			<span class="badge">{docTypeLabel(c.documentType)}</span>
			{#each c.categories as cat}
				<span class="badge secondary">{categoryLabel(cat)}</span>
			{/each}
		</div>
		<h1 class="case-title">{c.title}</h1>
		{#if c.publishedAt}
			<p class="case-meta">Publisert {formatDate(c.publishedAt)}</p>
		{/if}
	</div>

	<div class="case-actions">
		<a href={c.einnsynUrl} target="_blank" rel="noreferrer" class="primary-btn">
			Les originalsdokument på eInnsyn →
		</a>
	</div>
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

	.case-header {
		border-bottom: 3px solid var(--rod);
		padding-bottom: 2rem;
		margin-bottom: 2rem;
	}

	.case-title {
		font-family: 'Barlow Condensed', sans-serif;
		font-weight: 800;
		font-size: clamp(2rem, 5vw, 3.5rem);
		text-transform: uppercase;
		color: var(--burgunder);
		line-height: 1.05;
		margin-bottom: 0.5rem;
	}

	.case-meta {
		font-size: 0.9rem;
		opacity: 0.65;
	}

	.case-actions {
		margin-bottom: 3rem;
	}

	.primary-btn {
		display: inline-block;
		background: var(--rod);
		color: var(--krem);
		font-weight: 600;
		font-size: 0.95rem;
		padding: 0.75rem 1.5rem;
		text-decoration: none;
		transition: opacity 0.15s;
	}

	.primary-btn:hover { opacity: 0.88; }
</style>

<script lang="ts">
	import { browser } from '$app/environment';
	import { invalidateAll } from '$app/navigation';
	import { CATEGORIES, categoryLabel } from '$lib/categories.js';
	import type { Case } from '$lib/einnsyn.js';

	let { data } = $props();

	const categoryKeys = Object.keys(CATEGORIES);

	let refreshing = $state(false);

	async function handleRefresh() {
		refreshing = true;
		await fetch('/api/refresh', { method: 'POST' });
		await invalidateAll();
		refreshing = false;
	}

	// Preferences: use DB if logged in, localStorage otherwise
	function loadInitialInterests(): Set<string> {
		if (data.user) return new Set(data.user.interests);
		if (browser) {
			const stored = localStorage.getItem('gapl-interests');
			if (stored) {
				try { return new Set(JSON.parse(stored)); } catch { /* ignore */ }
			}
		}
		return new Set();
	}

	let interests: Set<string> = $state(loadInitialInterests());
	let onlyInterests = $state(false);
	let activeFilter: string | null = $state(null);

	async function toggleInterest(key: string) {
		if (interests.has(key)) interests.delete(key);
		else interests.add(key);
		interests = new Set(interests);

		if (data.user) {
			await fetch('/api/interests', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ interests: [...interests] })
			});
		} else if (browser) {
			localStorage.setItem('gapl-interests', JSON.stringify([...interests]));
		}
	}

	function setFilter(key: string | null) {
		activeFilter = activeFilter === key ? null : key;
	}

	const filtered: Case[] = $derived(
		data.cases.filter((c) => {
			if (onlyInterests && interests.size > 0) {
				if (!c.categories.some((cat) => interests.has(cat))) return false;
			}
			if (activeFilter) {
				if (!c.categories.includes(activeFilter)) return false;
			}
			return true;
		})
	);

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
	<title>Politiske saker | Grünerløkka Arbeiderpartilag</title>
</svelte:head>

<div class="container">
	<div class="page-header">
		<div>
			<h1 class="section-heading" style="margin-bottom:0.25rem">Politiske saker</h1>
			<p class="section-sub">Saker fra Grünerløkka bydelsutvalg via <img src="/e-innsyn.svg" alt="eInnsyn" class="einnsyn-logo-inline" /></p>
		</div>
		<button class="refresh-btn" onclick={handleRefresh} disabled={refreshing}>
			{#if refreshing}
				<span class="refresh-spinner"></span>Henter…
			{:else}
				↻ Oppdater fra <img src="/e-innsyn.svg" alt="eInnsyn" class="einnsyn-logo" />
			{/if}
		</button>
	</div>

	<div class="controls">
		<div class="filter-bar">
			{#each categoryKeys as key}
				<button
					class="filter-btn"
					class:active={activeFilter === key}
					onclick={() => setFilter(key)}
				>
					{categoryLabel(key)}
				</button>
			{/each}
		</div>

		<div class="interest-row">
			<button
				class="filter-btn"
				class:active={onlyInterests}
				onclick={() => (onlyInterests = !onlyInterests)}
			>
				Kun mine interesser
			</button>
			<span class="interest-hint">
				Rediger interesser:
				{#each categoryKeys as key}
					<button
						class="interest-chip"
						class:selected={interests.has(key)}
						onclick={() => toggleInterest(key)}
						title={categoryLabel(key)}
					>
						{categoryLabel(key)}
					</button>
				{/each}
			</span>
		</div>
	</div>

	{#if filtered.length === 0}
		<p class="empty-state">Ingen saker matcher valgte filtre.</p>
	{:else}
		<div class="cards-grid">
			{#each filtered as c}
				<a href="/saker/{encodeURIComponent(c.einnsynId)}" class="card">
					<div class="card-label">{docTypeLabel(c.documentType)}{c.publishedAt ? ` · ${formatDate(c.publishedAt)}` : ''}</div>
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
	{/if}
</div>

<style>
	.page-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.refresh-btn {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-family: 'Barlow Condensed', sans-serif;
		font-size: 0.85rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 0.4rem 0.9rem;
		background: transparent;
		border: 1.5px solid var(--burgunder);
		color: var(--burgunder);
		cursor: pointer;
		transition: all 0.15s;
		flex-shrink: 0;
		margin-top: 0.25rem;
	}

	.refresh-btn:hover:not(:disabled) {
		background: var(--burgunder);
		color: var(--krem);
	}

	.refresh-btn:disabled {
		opacity: 0.45;
		cursor: default;
	}

	.einnsyn-logo-inline {
		height: 1em;
		width: auto;
		vertical-align: middle;
		filter: brightness(0) saturate(100%) invert(23%) sepia(57%) saturate(500%) hue-rotate(270deg);
		opacity: 0.7;
	}

	.einnsyn-logo {
		height: 0.85em;
		width: auto;
		vertical-align: middle;
		filter: brightness(0) saturate(100%) invert(23%) sepia(57%) saturate(500%) hue-rotate(270deg);
		transition: filter 0.15s;
	}

	.refresh-btn:hover:not(:disabled) .einnsyn-logo {
		filter: brightness(0) saturate(100%) invert(97%) sepia(5%) saturate(400%) hue-rotate(20deg);
	}

	.refresh-spinner {
		width: 0.75rem;
		height: 0.75rem;
		border: 2px solid currentColor;
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	.controls {
		margin-bottom: 2rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.interest-row {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.interest-hint {
		font-size: 0.8rem;
		color: var(--burgunder);
		opacity: 0.7;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.3rem;
	}

	.interest-chip {
		font-size: 0.72rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 0.2rem 0.5rem;
		border: 1px solid rgba(86, 5, 34, 0.25);
		background: transparent;
		color: var(--burgunder);
		cursor: pointer;
		opacity: 0.6;
		transition: all 0.15s;
	}

	.interest-chip.selected {
		background: var(--burgunder);
		border-color: var(--burgunder);
		color: var(--krem);
		opacity: 1;
	}

	.interest-chip:hover { opacity: 1; }

	.empty-state {
		font-size: 1rem;
		color: var(--burgunder);
		opacity: 0.6;
		padding: 3rem 0;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>

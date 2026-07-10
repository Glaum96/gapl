<script lang="ts">
	import { categoryLabel } from '$lib/categories.js';
	import { invalidateAll } from '$app/navigation';
	import type { ProposalWithStats } from '$lib/interactions.js';

	let { data } = $props();
	const c = $derived(data.case);

	// Local state for optimistic updates; syncs back when server data arrives
	let proposals: ProposalWithStats[] = $state([...data.proposals]);
	$effect(() => {
		const incoming = data.proposals;
		proposals = [...incoming];
	});

	let proposalText = $state('');
	let proposalError = $state('');

	let openComments: Set<string> = $state(new Set());
	let commentTexts: Record<string, string> = $state({});

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
		return new Date(iso).toLocaleDateString('nb-NO', {
			day: 'numeric', month: 'long', year: 'numeric'
		});
	}

	function formatTime(ts: number): string {
		return new Date(ts).toLocaleDateString('nb-NO', {
			day: 'numeric', month: 'short', year: 'numeric'
		});
	}

	async function submitProposal() {
		const text = proposalText.trim();
		if (!text) return;
		proposalError = '';

		// Optimistic: legg til med temp-id
		const tempId = 'temp-' + Date.now();
		proposals = [
			...proposals,
			{
				id: tempId,
				caseId: c.einnsynId,
				userId: data.user!.email,
				userName: data.user!.name,
				text,
				createdAt: Date.now(),
				upvotes: 0,
				downvotes: 0,
				userVote: null,
				comments: []
			}
		];
		proposalText = '';

		const res = await fetch('/api/proposals', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ caseId: c.einnsynId, text })
		});
		if (!res.ok) {
			proposals = proposals.filter((p) => p.id !== tempId);
			proposalText = text;
			const err = await res.json().catch(() => ({}));
			proposalError = err.message ?? 'Noe gikk galt';
		}
		// $effect synkroniserer med ekte data fra server
		invalidateAll();
	}

	async function vote(proposal: ProposalWithStats, v: 1 | -1) {
		const idx = proposals.findIndex((p) => p.id === proposal.id);
		if (idx === -1) return;
		const p = proposals[idx];
		const retracting = p.userVote === v;
		const switching = p.userVote !== null && p.userVote !== v;

		// Optimistisk stemme-oppdatering
		proposals[idx] = {
			...p,
			userVote: retracting ? null : v,
			upvotes:
				p.upvotes +
				(v === 1 ? (retracting ? -1 : 1) : switching ? -1 : 0),
			downvotes:
				p.downvotes +
				(v === -1 ? (retracting ? -1 : 1) : switching ? -1 : 0)
		};

		fetch(`/api/proposals/${proposal.id}/vote`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ vote: v, caseId: c.einnsynId })
		}).then(() => invalidateAll());
	}

	function toggleComments(id: string) {
		const next = new Set(openComments);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		openComments = next;
	}

	async function submitComment(proposal: ProposalWithStats) {
		const id = proposal.id;
		const text = commentTexts[id]?.trim();
		if (!text) return;

		// Optimistisk kommentar
		const idx = proposals.findIndex((p) => p.id === id);
		if (idx !== -1) {
			proposals[idx] = {
				...proposals[idx],
				comments: [
					...proposals[idx].comments,
					{
						id: 'temp-' + Date.now(),
						proposalId: id,
						caseId: c.einnsynId,
						userId: data.user!.email,
						userName: data.user!.name,
						text,
						createdAt: Date.now()
					}
				]
			};
		}
		commentTexts = { ...commentTexts, [id]: '' };

		fetch(`/api/proposals/${id}/comments`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ caseId: c.einnsynId, text })
		}).then(() => invalidateAll());
	}

	async function deleteProposal(proposal: ProposalWithStats) {
		proposals = proposals.filter((p) => p.id !== proposal.id);
		fetch(`/api/proposals/${proposal.id}/delete`, { method: 'POST' })
			.then(() => invalidateAll());
	}

	async function deleteComment(proposal: ProposalWithStats, commentId: string) {
		const idx = proposals.findIndex((p) => p.id === proposal.id);
		if (idx !== -1) {
			proposals[idx] = {
				...proposals[idx],
				comments: proposals[idx].comments.filter((c) => c.id !== commentId)
			};
		}
		fetch(`/api/comments/${commentId}/delete`, { method: 'POST' })
			.then(() => invalidateAll());
	}

	function canDelete(userId: string): boolean {
		return !!data.user && (data.user.email === userId || data.user.role === 'admin');
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
			Les originaldokument på eInnsyn →
		</a>
	</div>

	<!-- Proposals section -->
	<section class="proposals-section">
		<h2 class="section-heading" style="font-size:1.5rem; margin-bottom:1.5rem">
			Innspill ({proposals.length})
		</h2>

		{#if proposals.length === 0}
			<p class="empty-state">Ingen innspill ennå. Vær den første!</p>
		{:else}
			<div class="proposals-list">
				{#each proposals as proposal (proposal.id)}
					{@const id = String(proposal.id)}
					<div class="proposal-card">
						<div class="proposal-body">
							<p class="proposal-text">{proposal.text}</p>
							<div class="proposal-meta-row">
								<p class="proposal-meta">{proposal.userName} · {formatTime(proposal.createdAt)}</p>
								{#if canDelete(proposal.userId)}
									<button class="inline-delete-btn" onclick={() => deleteProposal(proposal)}>Slett</button>
								{/if}
							</div>
						</div>

						<div class="proposal-actions">
							<div class="vote-row">
								<button
									class="vote-btn up"
									class:active={proposal.userVote === 1}
									onclick={() => vote(proposal, 1)}
									disabled={!data.user}
									title={data.user ? 'Støtt dette innspillet' : 'Logg inn for å stemme'}
								>
									▲ {proposal.upvotes}
								</button>
								<button
									class="vote-btn down"
									class:active={proposal.userVote === -1}
									onclick={() => vote(proposal, -1)}
									disabled={!data.user}
									title={data.user ? 'Stem ned' : 'Logg inn for å stemme'}
								>
									▼ {proposal.downvotes}
								</button>
								<button
									class="comment-toggle"
									onclick={() => toggleComments(id)}
								>
									💬 {proposal.comments.length}{openComments.has(id) ? ' ▴' : ' ▾'}
								</button>
							</div>

							{#if openComments.has(id)}
								<div class="comments-section">
									{#if proposal.comments.length > 0}
										<div class="comments-list">
											{#each proposal.comments as comment (comment.id)}
												<div class="comment">
													<div class="comment-header">
														<span class="comment-author">{comment.userName}</span>
														<span class="comment-date">{formatTime(comment.createdAt)}</span>
														{#if canDelete(comment.userId)}
															<button class="inline-delete-btn" onclick={() => deleteComment(proposal, comment.id)}>Slett</button>
														{/if}
													</div>
													<p class="comment-text">{comment.text}</p>
												</div>
											{/each}
										</div>
									{/if}

									{#if data.user}
										<div class="comment-form">
											<textarea
												rows="2"
												placeholder="Skriv en kommentar…"
												maxlength="500"
												bind:value={commentTexts[id]}
											></textarea>
											<button
												class="submit-btn small"
												onclick={() => submitComment(proposal)}
												disabled={!commentTexts[id]?.trim()}
											>
												Send
											</button>
										</div>
									{:else}
										<p class="login-prompt"><a href="/auth/login">Logg inn</a> for å kommentere</p>
									{/if}
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- New proposal form -->
		{#if data.user}
			<div class="new-proposal">
				<h3 class="new-proposal-heading">Legg inn innspill</h3>
				{#if proposalError}
					<p class="form-error">{proposalError}</p>
				{/if}
				<textarea
					rows="4"
					placeholder="Hva mener du om denne saken? (maks 1000 tegn)"
					maxlength="1000"
					bind:value={proposalText}
				></textarea>
				<div class="form-footer">
					<span class="char-count">{proposalText.length}/1000</span>
					<button
						class="submit-btn"
						onclick={submitProposal}
						disabled={!proposalText.trim()}
					>
						Send innspill
					</button>
				</div>
			</div>
		{:else}
			<div class="login-cta">
				<a href="/auth/login">Logg inn</a> for å legge inn innspill og stemme
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

	.proposals-section {
		border-top: 2px solid rgba(86, 5, 34, 0.12);
		padding-top: 2.5rem;
	}

	.proposals-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 2.5rem;
	}

	.proposal-card {
		border: 1px solid rgba(86, 5, 34, 0.15);
		background: white;
		padding: 1.25rem;
	}

	.proposal-text {
		font-size: 1rem;
		line-height: 1.55;
		color: var(--burgunder);
		margin-bottom: 0.4rem;
		white-space: pre-wrap;
	}

	.proposal-meta-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.proposal-meta {
		font-size: 0.78rem;
		opacity: 0.5;
	}

	.comment-header {
		display: flex;
		align-items: baseline;
		gap: 0.4rem;
		margin-bottom: 0.2rem;
		flex-wrap: wrap;
	}

	.inline-delete-btn {
		font-size: 0.7rem;
		font-weight: 600;
		padding: 0.1rem 0.4rem;
		background: transparent;
		border: 1px solid rgba(227, 28, 40, 0.25);
		color: var(--rod);
		cursor: pointer;
		font-family: inherit;
		opacity: 0.6;
		transition: all 0.15s;
		margin-left: auto;
	}
	.inline-delete-btn:hover { opacity: 1; background: var(--rod); color: white; border-color: var(--rod); }

	.vote-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.vote-btn {
		font-family: 'Barlow Condensed', sans-serif;
		font-size: 0.82rem;
		font-weight: 700;
		padding: 0.25rem 0.65rem;
		border: 1.5px solid rgba(86, 5, 34, 0.25);
		background: transparent;
		cursor: pointer;
		transition: all 0.15s;
		color: var(--burgunder);
	}
	.vote-btn:disabled { opacity: 0.35; cursor: default; }
	.vote-btn.up.active { background: var(--burgunder); color: var(--krem); border-color: var(--burgunder); }
	.vote-btn.down.active { background: var(--rod); color: var(--krem); border-color: var(--rod); }
	.vote-btn:not(:disabled):hover { opacity: 0.75; }

	.comment-toggle {
		font-size: 0.82rem;
		padding: 0.25rem 0.65rem;
		border: 1.5px solid rgba(86, 5, 34, 0.15);
		background: transparent;
		cursor: pointer;
		color: var(--burgunder);
		opacity: 0.65;
		transition: opacity 0.15s;
		font-family: inherit;
	}
	.comment-toggle:hover { opacity: 1; }

	.comments-section {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid rgba(86, 5, 34, 0.1);
	}

	.comments-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.comment {
		font-size: 0.88rem;
		color: var(--burgunder);
	}

	.comment-author {
		font-weight: 700;
		margin-right: 0.4rem;
	}

	.comment-date {
		opacity: 0.45;
		font-size: 0.78rem;
	}

	.comment-text {
		margin-top: 0.2rem;
		line-height: 1.45;
		white-space: pre-wrap;
	}

	.comment-form {
		display: flex;
		gap: 0.5rem;
		align-items: flex-start;
	}

	.comment-form textarea {
		flex: 1;
		padding: 0.4rem 0.6rem;
		border: 1.5px solid rgba(86, 5, 34, 0.2);
		font-family: inherit;
		font-size: 0.88rem;
		color: var(--burgunder);
		background: var(--krem);
		resize: none;
		outline: none;
	}
	.comment-form textarea:focus { border-color: var(--burgunder); }

	.new-proposal {
		background: white;
		border: 1px solid rgba(86, 5, 34, 0.15);
		padding: 1.5rem;
	}

	.new-proposal-heading {
		font-family: 'Barlow Condensed', sans-serif;
		font-size: 1.1rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--burgunder);
		margin-bottom: 1rem;
	}

	textarea {
		width: 100%;
		padding: 0.6rem 0.8rem;
		border: 1.5px solid rgba(86, 5, 34, 0.2);
		font-family: inherit;
		font-size: 0.95rem;
		color: var(--burgunder);
		background: var(--krem);
		resize: vertical;
		outline: none;
		box-sizing: border-box;
	}
	textarea:focus { border-color: var(--burgunder); }

	.form-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 0.5rem;
	}

	.char-count {
		font-size: 0.78rem;
		opacity: 0.45;
	}

	.submit-btn {
		padding: 0.55rem 1.25rem;
		background: var(--burgunder);
		color: var(--krem);
		border: none;
		font-family: 'Barlow Condensed', sans-serif;
		font-size: 0.95rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		cursor: pointer;
		transition: opacity 0.15s;
	}
	.submit-btn.small { padding: 0.4rem 0.9rem; font-size: 0.82rem; }
	.submit-btn:disabled { opacity: 0.4; cursor: default; }
	.submit-btn:hover:not(:disabled) { opacity: 0.82; }

	.form-error {
		background: rgba(227, 28, 40, 0.08);
		border-left: 3px solid var(--rod);
		padding: 0.5rem 0.75rem;
		margin-bottom: 0.75rem;
		font-size: 0.88rem;
		color: var(--rod);
	}

	.login-cta {
		padding: 1.25rem;
		border: 1px dashed rgba(86, 5, 34, 0.25);
		text-align: center;
		font-size: 0.95rem;
		color: var(--burgunder);
		opacity: 0.7;
	}
	.login-cta a, .login-prompt a { color: var(--burgunder); font-weight: 700; }

	.login-prompt {
		font-size: 0.82rem;
		color: var(--burgunder);
		opacity: 0.6;
		margin-top: 0.5rem;
	}

	.empty-state {
		font-size: 1rem;
		color: var(--burgunder);
		opacity: 0.5;
		margin-bottom: 2rem;
	}
</style>

<script lang="ts">
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	let deletingId: string | null = $state(null);

	function formatDate(ts: number): string {
		return new Date(ts).toLocaleDateString('nb-NO', {
			day: 'numeric', month: 'short', year: 'numeric'
		});
	}

	async function deleteProposal(id: string) {
		if (!confirm('Slett dette innspillet?')) return;
		deletingId = id;
		await fetch('/api/admin/delete-proposal', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id })
		});
		await invalidateAll();
		deletingId = null;
	}
</script>

<svelte:head>
	<title>Admin | Grünerløkka Arbeiderpartilag</title>
</svelte:head>

<div class="container">
	<h1 class="section-heading">Admin</h1>

	<div class="stats-row">
		<div class="stat-card">
			<span class="stat-num">{data.stats.users}</span>
			<span class="stat-label">Brukere</span>
		</div>
		<div class="stat-card">
			<span class="stat-num">{data.stats.proposals}</span>
			<span class="stat-label">Innspill</span>
		</div>
		<div class="stat-card">
			<span class="stat-num">{data.stats.votes}</span>
			<span class="stat-label">Stemmer</span>
		</div>
	</div>

	<section class="admin-section">
		<h2 class="admin-heading">Brukere ({data.users.length})</h2>
		<table class="admin-table">
			<thead>
				<tr>
					<th>Navn</th>
					<th>E-post</th>
					<th>Rolle</th>
					<th>Interesser</th>
					<th>Registrert</th>
				</tr>
			</thead>
			<tbody>
				{#each data.users as user (user.id)}
					<tr>
						<td>{user.name}</td>
						<td class="muted">{user.email}</td>
						<td>
							<span class="role-badge" class:admin={user.role === 'admin'}>
								{user.role ?? 'user'}
							</span>
						</td>
						<td class="muted">{user.interests?.length ? user.interests.join(', ') : '—'}</td>
						<td class="muted">{formatDate(user.createdAt)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</section>

	<section class="admin-section">
		<h2 class="admin-heading">Innspill ({data.proposals.length})</h2>
		<table class="admin-table">
			<thead>
				<tr>
					<th>Innspill</th>
					<th>Av</th>
					<th>Sak</th>
					<th>Dato</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each data.proposals as proposal (proposal.id)}
					<tr>
						<td class="proposal-text-cell">{proposal.text}</td>
						<td class="muted">{proposal.userName}</td>
						<td class="muted case-id-cell">{proposal.caseId}</td>
						<td class="muted">{formatDate(proposal.createdAt)}</td>
						<td>
							<button
								class="delete-btn"
								onclick={() => deleteProposal(proposal.id)}
								disabled={deletingId === proposal.id}
							>
								{deletingId === proposal.id ? '…' : 'Slett'}
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</section>
</div>

<style>
	.stats-row {
		display: flex;
		gap: 1rem;
		margin-bottom: 3rem;
	}

	.stat-card {
		flex: 1;
		background: white;
		border: 1px solid rgba(86, 5, 34, 0.12);
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.stat-num {
		font-family: 'Barlow Condensed', sans-serif;
		font-size: 2.5rem;
		font-weight: 800;
		color: var(--burgunder);
		line-height: 1;
	}

	.stat-label {
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-weight: 600;
		color: var(--burgunder);
		opacity: 0.5;
	}

	.admin-section {
		margin-bottom: 3rem;
	}

	.admin-heading {
		font-family: 'Barlow Condensed', sans-serif;
		font-size: 1.2rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--burgunder);
		margin-bottom: 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid rgba(86, 5, 34, 0.12);
	}

	.admin-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.88rem;
	}

	.admin-table th {
		text-align: left;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--burgunder);
		opacity: 0.5;
		padding: 0.5rem 0.75rem;
		border-bottom: 1px solid rgba(86, 5, 34, 0.12);
	}

	.admin-table td {
		padding: 0.6rem 0.75rem;
		border-bottom: 1px solid rgba(86, 5, 34, 0.06);
		vertical-align: top;
		color: var(--burgunder);
	}

	.admin-table tr:hover td {
		background: rgba(86, 5, 34, 0.02);
	}

	.muted { opacity: 0.6; }

	.proposal-text-cell {
		max-width: 360px;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.case-id-cell {
		max-width: 160px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 0.75rem;
	}

	.role-badge {
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		padding: 0.15rem 0.5rem;
		border: 1px solid rgba(86, 5, 34, 0.2);
		color: var(--burgunder);
		opacity: 0.6;
	}

	.role-badge.admin {
		background: var(--burgunder);
		color: var(--krem);
		border-color: var(--burgunder);
		opacity: 1;
	}

	.delete-btn {
		font-size: 0.75rem;
		font-weight: 700;
		padding: 0.2rem 0.6rem;
		background: transparent;
		border: 1px solid rgba(227, 28, 40, 0.3);
		color: var(--rod);
		cursor: pointer;
		font-family: inherit;
		transition: all 0.15s;
	}

	.delete-btn:hover:not(:disabled) {
		background: var(--rod);
		color: white;
		border-color: var(--rod);
	}

	.delete-btn:disabled { opacity: 0.4; cursor: default; }
</style>

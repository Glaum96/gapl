<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';

	let { children } = $props();
</script>

<header>
	<div class="header-inner">
		<a href="/" class="header-brand">
			<img src="/logo.png" alt="Arbeiderpartiet logo" class="header-logo" />
			<div class="header-text">
				<span class="header-title">Grünerløkka Arbeiderpartilag</span>
			</div>
		</a>
		<nav>
			<ul class="nav-links">
				<li><a href="/arrangementer" class:active={$page.url.pathname === '/arrangementer'}>Arrangementer</a></li>
				<li><a href="/saker" class:active={$page.url.pathname.startsWith('/saker')}>Politiske saker</a></li>
			</ul>
		</nav>
	</div>
</header>

{@render children()}

<footer>
	<p class="footer-name">Grünerløkka Arbeiderpartilag</p>
	<p>Alle arrangementer er åpne for medlemmer og interesserte</p>
	<p style="margin-top:1rem"><a href="https://www.arbeiderpartiet.no" target="_blank">arbeiderpartiet.no</a></p>
</footer>

<style>
	header {
		background: var(--burgunder);
		border-bottom: 3px solid var(--rod);
		padding: 0.75rem 2rem;
	}

	.header-inner {
		max-width: 1100px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
		flex-wrap: wrap;
	}

	.header-brand {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		text-decoration: none;
	}

	.header-logo {
		width: 40px;
		height: 40px;
		object-fit: contain;
		flex-shrink: 0;
	}

	.header-title {
		font-family: 'Barlow Condensed', sans-serif;
		font-weight: 800;
		font-size: clamp(1.1rem, 2.5vw, 1.7rem);
		text-transform: uppercase;
		color: var(--krem);
		letter-spacing: 0.02em;
		line-height: 1.05;
		white-space: nowrap;
	}

	nav ul {
		list-style: none;
		display: flex;
		gap: 0.5rem;
	}

	.nav-links a {
		font-size: 0.85rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		color: rgba(253, 250, 244, 0.75);
		text-decoration: none;
		padding: 0.45rem 1rem;
		border: 1.5px solid rgba(253, 250, 244, 0.25);
		transition: all 0.15s;
	}

	.nav-links a:hover {
		color: var(--krem);
		border-color: rgba(253, 250, 244, 0.6);
		background: rgba(253, 250, 244, 0.08);
	}

	.nav-links a.active {
		color: var(--burgunder);
		background: var(--krem);
		border-color: var(--krem);
	}

	@media (max-width: 640px) {
		header { padding: 0.6rem 1rem; }
		.header-logo { width: 32px; height: 32px; }
		.header-inner { gap: 0.75rem; }
	}
</style>

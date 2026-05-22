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
				<span class="header-title">Grünerløkka<br />Arbeiderpartilag</span>
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
		border-bottom: 4px solid var(--rod);
		padding: 1.5rem 2rem;
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
		width: 72px;
		height: 72px;
		object-fit: contain;
		flex-shrink: 0;
	}

	.header-title {
		font-family: 'Barlow Condensed', sans-serif;
		font-weight: 800;
		font-size: clamp(1.6rem, 3.5vw, 2.4rem);
		text-transform: uppercase;
		color: var(--krem);
		letter-spacing: 0.02em;
		line-height: 1.05;
	}

	nav ul {
		list-style: none;
		display: flex;
		gap: 0.25rem;
	}

	.nav-links a {
		font-size: 0.9rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		color: rgba(253, 250, 244, 0.65);
		text-decoration: none;
		padding: 0.4rem 0.9rem;
		transition: color 0.15s;
	}

	.nav-links a:hover,
	.nav-links a.active {
		color: var(--krem);
	}

	@media (max-width: 640px) {
		header { padding: 1.25rem; }
		.header-logo { width: 52px; height: 52px; }
		.header-inner { gap: 1rem; }
	}
</style>

<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Registrer deg | Grünerløkka Arbeiderpartilag</title>
</svelte:head>

<div class="container">
	<div class="auth-card">
		<h1 class="section-heading">Registrer deg</h1>

		{#if form?.error}
			<p class="form-error">{form.error}</p>
		{/if}

		<form method="POST" use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				await update();
				loading = false;
			};
		}}>
			<div class="field">
				<label for="name">Navn</label>
				<input id="name" name="name" type="text" autocomplete="name" required />
			</div>
			<div class="field">
				<label for="email">E-post</label>
				<input id="email" name="email" type="email" autocomplete="email" required />
			</div>
			<div class="field">
				<label for="password">Passord</label>
				<input id="password" name="password" type="password" autocomplete="new-password" minlength="8" required />
			</div>
			<button type="submit" class="btn-primary" disabled={loading}>
				{loading ? 'Registrerer…' : 'Registrer deg'}
			</button>
		</form>

		<p class="auth-link">Har du allerede konto? <a href="/auth/login">Logg inn</a></p>
	</div>
</div>

<style>
	.auth-card {
		max-width: 420px;
		margin: 4rem auto;
		padding: 2.5rem;
		background: white;
		border: 1px solid rgba(86, 5, 34, 0.12);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		margin-bottom: 1.25rem;
	}

	label {
		font-size: 0.85rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--burgunder);
	}

	input {
		padding: 0.6rem 0.8rem;
		border: 1.5px solid rgba(86, 5, 34, 0.25);
		font-family: inherit;
		font-size: 1rem;
		color: var(--burgunder);
		background: var(--krem);
		outline: none;
		transition: border-color 0.15s;
	}

	input:focus {
		border-color: var(--burgunder);
	}

	.btn-primary {
		width: 100%;
		padding: 0.7rem;
		background: var(--burgunder);
		color: var(--krem);
		border: none;
		font-family: 'Barlow Condensed', sans-serif;
		font-size: 1rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		cursor: pointer;
		transition: opacity 0.15s;
		margin-top: 0.5rem;
	}

	.btn-primary:disabled { opacity: 0.5; cursor: default; }
	.btn-primary:hover:not(:disabled) { opacity: 0.85; }

	.form-error {
		background: rgba(227, 28, 40, 0.08);
		border-left: 3px solid var(--rod);
		padding: 0.6rem 0.8rem;
		margin-bottom: 1.25rem;
		font-size: 0.9rem;
		color: var(--rod);
	}

	.auth-link {
		margin-top: 1.5rem;
		font-size: 0.9rem;
		text-align: center;
		color: var(--burgunder);
		opacity: 0.7;
	}

	.auth-link a {
		color: var(--burgunder);
		font-weight: 600;
	}
</style>

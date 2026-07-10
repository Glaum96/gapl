<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => goto('/saker', { replaceState: true }));
</script>

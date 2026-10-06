<script>
	import { Avatar } from '@khwarizmi/svelte-ui';
	let { nama, size = 'size-9' } = $props();
	// Ukuran lama (kelas Tailwind) -> ukuran Khwarizmi UI
	const map = { 'size-8': 'sm', 'size-9': 'md', 'size-10': 'md', 'size-11': 'md' };
	const tampil = $derived(nama.replace(/^(MT|CV|PT)\s+/, '').replace(/-/g, ' '));
</script>

<Avatar name={tampil} size={map[size] ?? 'md'} />

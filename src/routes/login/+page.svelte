<script>
	import { Button, Radio, Avatar } from '@khwarizmi/svelte-ui';
	import Icon from '$lib/components/Icon.svelte';
	import { akun, labelRole } from '$lib/data.js';
	import { masuk } from '$lib/auth.js';

	let selected = $state('1');
	const pilihan = $derived(akun.find((a) => a.id === parseInt(selected)));

	const fitur = ['Catat penjualan dalam hitungan detik', 'Stok ter-update otomatis', 'Laporan keuangan siap unduh'];
</script>

<svelte:head><title>Masuk · UBER POKJA</title></svelte:head>

<div class="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
	<!-- Panel identitas -->
	<aside class="dots-bg relative hidden flex-col justify-between overflow-hidden bg-brand-800 p-12 text-white lg:flex">
		<a href="/" class="flex items-center gap-3">
			<img src="/logo.png" alt="" class="size-11" />
			<div class="leading-tight">
				<p class="font-black">UBER POKJA</p>
				<p class="text-xs font-bold text-brand-100">Majelis Taklim Tenjolaya</p>
			</div>
		</a>

		<div class="max-w-md">
			<p class="text-xs font-black tracking-widest text-gold-400 uppercase">Usaha Bersama</p>
			<h1 class="mt-3 text-4xl leading-[1.15] font-black tracking-tight">Kelola usaha bersama dengan rapi dan amanah.</h1>
			<ul class="mt-8 space-y-3">
				{#each fitur as f}
					<li class="flex items-center gap-3 font-bold text-brand-100">
						<span class="grid size-6 place-items-center rounded-full bg-white/10 text-gold-400"><Icon name="check" class="size-3.5" strokeWidth={3} /></span>
						{f}
					</li>
				{/each}
			</ul>
		</div>

		<p class="text-xs font-bold text-brand-100/80">© 2026 UBER POKJA · Majelis Taklim Tenjolaya</p>
		<img src="/logo.png" alt="" class="pointer-events-none absolute -right-24 -bottom-24 size-96 opacity-[0.06] grayscale" />
	</aside>

	<!-- Form -->
	<main class="flex items-center justify-center px-5 py-10 sm:px-8">
		<form
			class="w-full max-w-md"
			onsubmit={(e) => {
				e.preventDefault();
				masuk(pilihan);
			}}
		>
			<a href="/" class="mb-10 flex items-center gap-3 lg:hidden">
				<img src="/logo.png" alt="" class="size-10" />
				<div class="leading-tight">
					<p class="font-black">UBER POKJA</p>
					<p class="text-xs font-bold text-muted">MT Tenjolaya</p>
				</div>
			</a>

			<h2 class="text-2xl font-black tracking-tight lg:text-[28px]">Selamat datang kembali</h2>
			<p class="mt-2 text-sm font-bold text-slate-400">Pilih akun contoh untuk melihat aplikasi dari sudut pandang tiap peran.</p>

			<fieldset class="mt-8">
				<legend class="mb-2 ml-1 text-xs font-black tracking-widest text-slate-400 uppercase">Masuk sebagai</legend>
				<div class="space-y-2.5">
					{#each akun as a}
						{@const on = selected === String(a.id)}
						<div
							class="flex items-center gap-3 rounded-2xl border bg-white p-3 transition {on
								? 'border-primary-400 shadow-[0_3px_0_0_var(--primary-300)]'
								: 'border-slate-200 shadow-[0_3px_0_0_#E2E8F0]'}"
						>
							<Avatar name={a.nama} size="md" />
							<div class="akun-radio min-w-0 flex-1">
								<Radio name="akun" value={String(a.id)} {selected} label={a.nama} description={labelRole(a.role)} onchange={(v) => (selected = v)} />
							</div>
						</div>
					{/each}
				</div>
			</fieldset>

			<Button type="submit" size="lg" fullWidth class="mt-6">Masuk sebagai {pilihan?.nama}</Button>
			<p class="mt-5 text-center text-xs font-bold text-slate-400">Mockup: tidak perlu kata sandi. <a href="/" class="font-black text-primary-600 hover:underline">Kembali ke beranda</a></p>
		</form>
	</main>
</div>

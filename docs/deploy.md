# Deploy

Aplikasi berjalan di **Cloudflare Pages**: https://uber-pokja.pages.dev
(akun Cloudflare `uwangraph`, project `uber-pokja`).

## Manual

```sh
npm run deploy
```

Script ini menjalankan `vite build` lalu `wrangler pages deploy` ke folder `.svelte-kit/cloudflare`
(lihat `pages_build_output_dir` di [wrangler.toml](../wrangler.toml)).

## Otomatis (Git)

Di dashboard Pages: project `uber-pokja` > Settings > Git integration, hubungkan repo GitHub.

- Build command: `npm run build`
- Output directory: `.svelte-kit/cloudflare`

## Catatan

- Config Pages tidak mendukung `account_id`, jadi ID akun diset lewat env `CLOUDFLARE_ACCOUNT_ID` di script deploy.
- Sebelumnya aplikasi berjalan sebagai Worker `uber-pokja` (workers.dev). Worker itu sudah digantikan Pages.

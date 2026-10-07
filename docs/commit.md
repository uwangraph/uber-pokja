# Catatan Cara Commit

Panduan singkat membuat commit dan push di repo ini.

## Alur dasar

```sh
git status                 # lihat file yang berubah
git diff                   # periksa isi perubahan
git add <file>             # pilih file (hindari git add . kalau ada file yang tidak ikut)
git commit -m "tipe(ruang): deskripsi singkat"
git push
```

Cek hasilnya dengan `git log --oneline -5`.

## Format pesan commit

```text
tipe(ruang): deskripsi singkat dengan huruf kecil
```

- Ditulis dalam **bahasa Indonesia**, singkat, tanpa titik di akhir.
- `ruang` (scope) opsional: bagian yang diubah, misalnya `marketplace`, `mt`, `deploy`, `docs`, `landing`.

### Tipe

| Tipe | Dipakai untuk |
| --- | --- |
| `feat` | Fitur baru atau perubahan perilaku aplikasi |
| `fix` | Perbaikan bug |
| `docs` | Perubahan dokumentasi saja |
| `chore` | Pekerjaan pendukung: deploy, konfigurasi, dependensi |
| `refactor` | Merapikan kode tanpa mengubah perilaku |
| `style` | Perubahan tampilan/format tanpa mengubah logika |
| `test` | Menambah atau mengubah pengujian |

### Contoh dari repo ini

```text
feat(marketplace): ubah jadi marketplace multi-toko ala Shopee dengan pencarian toko terdekat
feat(mt): ganti data contoh MT dengan 70 data Majelis Taklim asli se-Tenjolaya
chore(deploy): pindah dari Workers ke Cloudflare Pages
feat(landing): hapus tombol Marketplace dari navbar
```

## Commit dengan penjelasan panjang

Untuk perubahan yang butuh konteks, tambah isi (body) setelah satu baris kosong:

```sh
git commit -m "feat(marketplace): wajib masuk sebelum memesan" -m "Pembeli diarahkan ke /marketplace/masuk untuk melengkapi data pribadi."
```

## Aturan praktis

- Satu commit = satu maksud perubahan. Pisahkan fitur, perbaikan, dan dokumentasi.
- Jalankan `npm run build` sebelum commit untuk memastikan tidak ada error.
- Jangan commit file rahasia (token, `.env`) dan folder hasil build (`.svelte-kit`, `node_modules`, `.wrangler`).
- Push langsung ke `main` hanya untuk perubahan kecil. Untuk perubahan besar, buat branch dulu:

```sh
git switch -c feat/nama-fitur
git push -u origin feat/nama-fitur
```

## Setelah push

Push ke GitHub belum otomatis mengubah situs. Naikkan ke https://uber-pokja.pages.dev dengan:

```sh
npm run deploy
```

## Salah commit?

| Situasi | Perintah |
| --- | --- |
| Ubah pesan commit terakhir (belum di-push) | `git commit --amend -m "pesan baru"` |
| Batalkan commit terakhir, perubahan tetap ada | `git reset --soft HEAD~1` |
| Batalkan commit yang sudah di-push | `git revert <hash>` lalu push |
| Keluarkan file dari staging | `git restore --staged <file>` |

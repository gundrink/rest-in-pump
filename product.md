# Rest In Pump 🎃⚰️ — Product Spec

> Kuburan digital untuk koin memecoin Solana yang sudah mati. Lucu, ringan, mudah di-share. Bukan platform trading dan bukan saran finansial.

## 1. Ringkasan
**Rest In Pump** adalah web app bertema Halloween. Orang bisa melihat "nisan" koin yang sudah mati, dan menghubungkan wallet (read-only) untuk melihat **kuburan pribadi** mereka: koin-koin yang pernah mereka hold dan sekarang sudah mati. Setiap nisan punya epitaf lucu, dan kuburan bisa dibagikan ke X.

## 2. Masalah dan peluang
- Mayoritas trader memecoin pernah rugi (isu 97% trader rugi, boikot Pump.fun, Okt 2026).
- Orang suka pamer rugi dengan humor ("kita semua pernah kena").
- Meta koin sekarang menang di hal yang lucu dan gampang di-meme-kan, bukan mekanisme rumit.
- Halloween (31 Okt) memberi momentum musiman.

## 3. Target pengguna
- Trader memecoin Solana (terutama pengguna pump.fun) yang aktif di X/CT.
- Kreator konten meme yang butuh bahan share.

## 4. Prinsip produk
1. **Fun dulu.** Tidak ada janji profit, airdrop, atau refund.
2. **Aman.** Connect wallet hanya baca alamat publik. Tidak ada tanda tangan, transaksi, atau seed phrase.
3. **Bercanda ke arah "kita semua pernah kena"**, bukan mengejek korban.
4. **Cepat dan murah.** Web statis plus data publik, tanpa smart contract di MVP.

## 5. Fitur MVP
| # | Fitur | Deskripsi |
|---|-------|-----------|
| 1 | Landing page | Maskot hantu/labu imut, tagline, tombol "Lihat kuburanku". |
| 2 | Graveyard publik | Grid nisan koin mati: nama, tiker, lahir/wafat, ATH, penyebab kematian, epitaf. |
| 3 | My Graveyard | Connect wallet (read-only) atau paste alamat untuk lihat nisan koin yang pernah di-hold. |
| 4 | Epitaph generator | Minimal 30 template epitaf, dipilih deterministik dari statistik koin. |
| 5 | Share ke X | Gambar otomatis ("Kuburanku punya 14 nisan 💀") + link post X siap kirim. |
| 6 | Mode mock | Berjalan tanpa API key memakai data contoh yang jelas diberi label EXAMPLE. |

## 6. Definisi "koin mati"
Koin dianggap mati bila memenuhi salah satu:
- harga turun lebih dari 90% dari puncak (ATH), atau
- volume 24 jam mendekati nol selama beberapa hari berturut-turut (ambang diatur di config).

## 7. Alur pengguna
1. Buka situs, lihat graveyard publik.
2. Klik "My Graveyard", lalu connect wallet atau paste alamat.
3. Sistem baca holdings/riwayat, cek harga dan volume, klasifikasi mati/hidup.
4. Tampil nisan dengan epitaf.
5. Klik Share, gambar dibuat, post ke X.

## 8. Sumber data
- **Helius API** (env `HELIUS_API_KEY`): riwayat token wallet.
- **DexScreener** (publik): harga, volume, data pasangan.
- Semua panggilan lewat route server, dengan cache untuk menekan biaya dan rate limit.

## 9. Tech stack
Next.js (App Router) + TypeScript + Tailwind, `@solana/wallet-adapter` (read-only), siap deploy ke Vercel.

## 10. Keamanan dan privasi
- Tidak pernah meminta signature atau transaksi.
- Pesan jelas di UI: "Connect ini read-only."
- Wallet itu publik, jadi nada tampilan harus candaan, bukan sindiran personal.
- Tidak menyimpan data wallet lebih dari cache sementara.

## 11. Di luar cakupan MVP
- Token sendiri ($RIP/$GRAVE), voting, airdrop, buyback, "Zombie Night".
- Smart contract atau launchpad penuh.
- Akun pengguna dan database permanen.

## 12. Risiko
| Risiko | Mitigasi |
|--------|----------|
| Biaya RPC/API naik saat ramai | Cache agresif, mode mock, rate limit |
| Dikira wallet drainer | Read-only, copy jelas, tanpa signature, tampilkan kode open-source |
| Data harga salah/lama | Tampilkan waktu update, label sumber |
| Backlash karena terkesan mengejek | Tone "kita semua pernah kena", opsi sembunyikan nominal rugi |
| Waktu sempit sebelum Halloween | MVP kecil, rilis cepat, iterasi setelahnya |

## 13. Metrik sukses
- Jumlah wallet yang dicek dan jumlah share ke X.
- Rasio klik Share terhadap kuburan yang dibuka.
- Impresi/post organik yang menyebut situs.

## 14. Rencana rilis
1. **H0–H2:** MVP mock mode + UI dan epitaf.
2. **H3–H4:** Data live Helius + DexScreener, share image.
3. **H5 (Halloween):** Rilis publik, tweet launch, konten "epitaph of the day".
4. **Setelah itu:** Evaluasi, baru pertimbangkan koin atau fitur lanjutan.

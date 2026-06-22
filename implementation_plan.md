# Pelan Pelaksanaan - Pembetulan Database & Refinements Permohonan

Dokumen ini memperincikan rancangan untuk menyelaraskan skema pangkalan data dengan kod aplikasi, membetulkan masalah pengesanan dokumen vault, dan membolehkan muat naik fail terus dari borang permohonan.

## User Review Required

> [!IMPORTANT]
> - Lajur jadual `applications` dan `profiles` di Supabase diselaraskan mengikut skema asal dalam `seed.sql`.
> - Susunan pemeriksaan jenis dokumen diubah untuk mengelakkan ralat klasifikasi (contoh: "Surat Tawaran Universiti" dikesan sebagai "Transkrip Universiti" bukannya "Surat Tawaran IPT").

## Proposed Changes

### API & Database Integration

---

#### [MODIFY] [route.ts](file:///Users/dzulhilmy/e-yp/src/app/api/applications/create/route.ts)
- Menyelaraskan nama lajur untuk padanan skema jadual `applications`:
  - Tukar `reference_number` kepada `ref`.
  - Tukar `program_id` kepada `program` (menyimpan tajuk program secara teks).
  - Tukar `form_data` kepada `data`.
  - Mengeluarkan lajur `submitted_at` kerana ia tidak wujud dalam skema (tarikh dijanakan secara auto oleh `created_at` pangkalan data).

#### [MODIFY] [route.ts](file:///Users/dzulhilmy/e-yp/src/app/api/auth/user/route.ts)
- Menyelaraskan pemilihan profil berdasarkan skema jadual `profiles`:
  - Tukar `.eq('id', user.id)` kepada `.eq('user_id', user.id)`.
  - Pilih lajur `user_id, full_name, email, phone, nric` bukannya `id, full_name, email, phone, ic_number`.

---

### UI & Frontend Components

---

#### [MODIFY] [page.tsx](file:///Users/dzulhilmy/e-yp/src/app/apply/page.tsx)
- **Pembetulan Pemuatan Profil**:
  - Tukar query profil untuk padanan skema jadual `profiles` (menggunakan `user_id` dan lajur `nric`).
- **Pembetulan Pengesanan Dokumen**:
  - Menyusun semula `inferVaultType` supaya menyemak `"tawaran"` / `"offer"` sebelum `"universiti"`, membolehkan "Surat Tawaran Universiti" dikesan sebagai "Surat Tawaran IPT".
- **Fungsi Muat Naik Terus**:
  - Tambah input fail tersembunyi.
  - Sediakan butang "Muat Naik" interaktif dalam senarai dokumen.
  - Integrasi proses muat naik ke Supabase Storage (bucket `vault`) dan panggil API `/api/vault/upload` untuk kemas kini automatik.

#### [MODIFY] [page.tsx](file:///Users/dzulhilmy/e-yp/src/app/dashboard/page.tsx)
- Menambah kawalan keselamatan (safeguard) pada pemaparan permohonan dari DB untuk mengelakkan crash apabila lajur `steps` bernilai undefined.
- Membina penjejak langkah (`steps`) secara dinamik berdasarkan status permohonan.
- Memadankan warna dan label status untuk status bernilai `submitted` (Dihantar).

## Verification Plan

### Manual Verification
1. Uji pengisian automatik profil (prefill) pada Langkah 1 borang permohonan.
2. Uji muat naik fail bagi dokumen yang tiada dalam vault terus dari halaman permohonan.
3. Hantar permohonan baharu dan pastikan tiada ralat pangkalan data (database error).
4. Semak status permohonan baharu tersebut di dashboard untuk memastikan ia dipaparkan dengan betul tanpa sebarang crash.

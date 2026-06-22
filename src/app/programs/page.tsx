"use client";
import Link from "next/link";
import ProgramCard from "@/components/ProgramCard";
import {
  BookOpen,
  GraduationCap,
  Home,
  Briefcase,
  ChevronRight,
  Check,
} from "lucide-react";

const programs = [
  {
    id: "insisyp",
    icon: GraduationCap,
    color: "#F5A623",
    bg: "rgba(245,166,35,0.12)",
    category: "Pendidikan",
    tag: "Popular",
    title: "Insentif Siswa Yayasan Perak (INSISYP)",
    desc: "Bantuan kewangan bagi pelajar cemerlang Perak yang melanjutkan pelajaran ke institut pengajian tinggi dalam dan luar negara.",
    amount: "RM 1,500 – RM 5,000",
    deadline: "30 Jun 2026",
    href: "/login",
  },
  {
    id: "taspendik",
    icon: BookOpen,
    color: "#0EA5E9",
    bg: "rgba(14,165,233,0.12)",
    category: "Pendidikan",
    tag: "Terbuka",
    title: "TASPENDIK – Tabung Pendidikan Anak Perak",
    desc: "Skim simpanan pendidikan untuk bayi dan kanak-kanak Perak, bertujuan membina tabung pembelajaran sejak awal usia.",
    amount: "RM 200 Simpanan Permulaan",
    deadline: "Sepanjang Tahun",
    href: "/login",
  },
  {
    id: "sayangirumah",
    icon: Home,
    color: "#10B981",
    bg: "rgba(16,185,129,0.12)",
    category: "Sosial",
    tag: "Pembaikan Rumah",
    title: "Sayangi Rumahku",
    desc: "Program pembaikan dan penambahbaikan rumah untuk keluarga B40 Perak yang memerlukan sokongan segera.",
    amount: "Sehingga RM 15,000",
    deadline: "31 Ogos 2026",
    href: "/login",
  },
  {
    id: "usahawan",
    icon: Briefcase,
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.12)",
    category: "Usahawan",
    tag: "Pinjaman",
    title: "Pinjaman Tabung Usahawan",
    desc: "Sokongan modal permulaan untuk usahawan muda Perak yang ingin memulakan atau mengembangkan perniagaan.",
    amount: "RM 5,000 – RM 50,000",
    deadline: "30 Sept 2026",
    href: "/login",
  },
];

export default function ProgramsPage() {
  return (
    <>
      <div className="page-hero">
        <div className="page-hero-bg" />
        <div className="container">
          <div
            className="section-label"
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <BookOpen size={16} /> Program Bantuan
          </div>
          <h1
            className="heading-lg"
            style={{ marginTop: 12, marginBottom: 16 }}
          >
            Cari Program <span className="gradient-text">Bantuan</span> Yang
            Sesuai
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "1rem",
              maxWidth: 580,
              lineHeight: 1.8,
            }}
          >
            Jelajah tawaran program Yayasan Perak untuk bantuan pendidikan,
            sosial, perumahan dan usahawan. Semak kelayakan anda dan mula
            permohonan dengan cepat.
          </p>
        </div>
      </div>

      <div className="container section-sm">
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 18,
            marginBottom: 28,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div className="section-label" style={{ marginBottom: 8 }}>
              <Check size={16} /> Program Aktif
            </div>
            <p style={{ color: "var(--text-secondary)", maxWidth: 520 }}>
              Lihat pilihan program semasa dan mulakan permohonan dalam beberapa
              langkah mudah.
            </p>
          </div>
          <Link href="/apply" className="btn btn-primary">
            Mohon Sekarang <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid-4">
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>

        <div
          style={{
            marginTop: 40,
            padding: 28,
            borderRadius: 24,
            background: "rgba(14,165,233,0.08)",
            border: "1px solid rgba(14,165,233,0.16)",
          }}
        >
          <h2 className="heading-md" style={{ marginBottom: 18 }}>
            3 Langkah Mudah
          </h2>
          <div style={{ display: "grid", gap: 18 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  background: "rgba(15,23,42,0.7)",
                  display: "grid",
                  placeContent: "center",
                  color: "white",
                  fontWeight: 700,
                }}
              >
                1
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>
                  Pilih program
                </h3>
                <p
                  style={{ margin: "6px 0 0", color: "var(--text-secondary)" }}
                >
                  Semak syarat, kategori dan bantuan yang ditawarkan.
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  background: "rgba(15,23,42,0.7)",
                  display: "grid",
                  placeContent: "center",
                  color: "white",
                  fontWeight: 700,
                }}
              >
                2
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>
                  Isi maklumat
                </h3>
                <p
                  style={{ margin: "6px 0 0", color: "var(--text-secondary)" }}
                >
                  Lengkapkan borang permohonan dengan dokumen sokongan.
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  background: "rgba(15,23,42,0.7)",
                  display: "grid",
                  placeContent: "center",
                  color: "white",
                  fontWeight: 700,
                }}
              >
                3
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>
                  Semak status
                </h3>
                <p
                  style={{ margin: "6px 0 0", color: "var(--text-secondary)" }}
                >
                  Tunggu kemas kini dan terima notifikasi melalui dashboard
                  anda.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

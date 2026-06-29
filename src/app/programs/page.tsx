"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProgramCard from "@/components/ProgramCard";
import {
  BookOpen,
  GraduationCap,
  Home,
  Briefcase,
  ChevronRight,
  Check,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const categoryStyles: Record<string, { color: string; bg: string }> = {
  Pendidikan: { color: "#F5A623", bg: "rgba(245,166,35,0.12)" },
  Sosial: { color: "#10B981", bg: "rgba(16,185,129,0.12)" },
  Usahawan: { color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
  default: { color: "#0EA5E9", bg: "rgba(14,165,233,0.12)" },
};

function getProgramIcon(category?: string) {
  if (category === "Pendidikan") return GraduationCap;
  if (category === "Sosial") return Home;
  if (category?.toLowerCase().includes("usaha")) return Briefcase;
  return BookOpen;
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("programs")
          .select("*")
          .eq("is_active", true)
          .order("title");

        if (!error && data) {
          setPrograms(
            data.map((item: any) => {
              const style =
                categoryStyles[item.category] || categoryStyles.default;
              return {
                id: item.id,
                icon: getProgramIcon(item.category),
                color: style.color,
                bg: style.bg,
                category: item.category || "Lain-lain",
                tag: item.category || "Terbuka",
                title: item.title,
                desc: item.description || item.subtitle || "",
                amount: item.subtitle || "",
                deadline: item.deadline || "Semasa",
                href: item.href || "/login",
              };
            }),
          );
        }
      } catch (err) {
        console.error("Program fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, []);

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
          {loading ? (
            <div
              style={{
                gridColumn: "1 / -1",
                color: "var(--text-muted)",
                padding: 24,
                textAlign: "center",
              }}
            >
              Memuatkan program...
            </div>
          ) : programs.length === 0 ? (
            <div
              style={{
                gridColumn: "1 / -1",
                color: "var(--text-muted)",
                padding: 24,
                textAlign: "center",
              }}
            >
              Tiada program aktif ditemui.
            </div>
          ) : (
            programs.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))
          )}
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

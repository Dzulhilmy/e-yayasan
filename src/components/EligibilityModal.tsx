"use client";
import { useEffect } from "react";
import { X, CheckCircle, Wallet, Clock, ArrowRight } from "lucide-react";

type Program = {
  id: string;
  title: string;
  color?: string;
  bg?: string;
  category?: string;
  amount?: string;
  deadline?: string;
  icon?: React.ComponentType<{ size?: number; color?: string }>;
};

const eligibilityByProgram: Record<string, string[]> = {
  insisyp: [
    "Warganegara Malaysia atau pemastautin tetap",
    "Berkediaman di negeri Perak",
    "Pelajar cemerlang dengan keputusan akademik yang baik",
    "Melanjutkan pelajaran ke IPT yang diiktiraf",
    "Mempunyai salinan IC, transkrip dan bukti pendapatan keluarga",
  ],
  taspendik: [
    "Warganegara Malaysia atau pemastautin tetap",
    "Berkediaman di negeri Perak",
    "Bayi atau kanak-kanak berumur 0–12 tahun",
    "Ibu bapa / penjaga perlu membuka akaun bagi pihak anak",
    "Mempunyai salinan IC ibu bapa dan sijil kelahiran kanak-kanak",
  ],
  sayangirumah: [
    "Warganegara Malaysia atau pemastautin tetap",
    "Berkediaman di negeri Perak",
    "Pendapatan isi rumah dalam kategori B40",
    "Rumah adalah hak milik pemohon atau anak-pinak",
    "Mempunyai salinan IC, geran tanah dan bukti pendapatan",
  ],
  usahawan: [
    "Warganegara Malaysia atau pemastautin tetap",
    "Berkediaman di negeri Perak",
    "Berumur 18–45 tahun",
    "Mempunyai perancangan perniagaan yang jelas",
    "Mempunyai salinan IC, pelan perniagaan dan penyata bank",
  ],
};

const defaultEligibility = [
  "Warganegara Malaysia atau pemastautin tetap",
  "Berkediaman di negeri Perak",
  "Menepati kategori program (contoh: pelajar/usahawan/rumah)",
  "Mempunyai dokumen sokongan seperti salinan IC dan bukti pendapatan",
];

export default function EligibilityModal({
  open,
  onClose,
  program,
}: {
  open: boolean;
  onClose: () => void;
  program: Program | null;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !program) return null;

  const accent = program.color ?? "#F5A623";
  const Icon = program.icon;
  const eligibility = eligibilityByProgram[program.id] ?? defaultEligibility;

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "grid",
        placeItems: "center",
        padding: 24,
        /* Solid enough backdrop — cards will NOT bleed through */
        background: "rgba(4, 10, 22, 0.82)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      {/* Panel — fully opaque, no CSS variable dependency */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 540,
          borderRadius: 24,
          /* Hard-coded solid background — immune to CSS variable issues */
          background: "#0b1a2e",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset",
          overflow: "hidden",
        }}
      >
        {/* Coloured top bar */}
        <div style={{ height: 4, background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />

        <div style={{ padding: 28 }}>
          {/* Header row */}
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 22 }}>
            {Icon && (
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 14,
                  background: program.bg ?? `${accent}18`,
                  border: `1.5px solid ${accent}30`,
                  display: "grid",
                  placeContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={22} color={accent} />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              {program.category && (
                <div style={{
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  color: accent,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 5,
                }}>
                  {program.category}
                </div>
              )}
              <h3 style={{
                margin: 0,
                fontSize: "1.05rem",
                fontWeight: 800,
                color: "#f0f6ff",
                lineHeight: 1.35,
                letterSpacing: "-0.01em",
              }}>
                {program.title}
              </h3>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Tutup"
              style={{
                flexShrink: 0,
                width: 34,
                height: 34,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.05)",
                color: "#7a95b8",
                display: "grid",
                placeContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Amount + Deadline chips */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
            <span style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 999,
              background: `${accent}14`, border: `1px solid ${accent}30`,
              color: accent, fontSize: "0.8rem", fontWeight: 800,
            }}>
              <Wallet size={12} /> {program.amount}
            </span>
            <span style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 999,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
              color: "#8aadcc", fontSize: "0.8rem", fontWeight: 600,
            }}>
              <Clock size={12} /> Tutup: {program.deadline}
            </span>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 22 }} />

          {/* Eligibility section */}
          <div style={{
            fontSize: "0.67rem", fontWeight: 800, color: "#4a6a8a",
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10,
          }}>
            Syarat Kelayakan
          </div>
          <p style={{ margin: "0 0 16px", fontSize: "0.845rem", color: "#6a8aaa", lineHeight: 1.7 }}>
            Sila semak syarat-syarat asas sebelum memohon. Dokumen yang diperlukan ditunjukkan di bawah.
          </p>

          <ul style={{ margin: "0 0 26px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
            {eligibility.map((item) => (
              <li
                key={item}
                style={{
                  display: "flex", gap: 10, alignItems: "flex-start",
                  fontSize: "0.875rem", color: "#d0e4f8", lineHeight: 1.65,
                }}
              >
                <CheckCircle size={15} color={accent} style={{ flexShrink: 0, marginTop: 3 }} />
                {item}
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: "12px 0", borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.09)",
                background: "rgba(255,255,255,0.04)",
                color: "#8aadcc", fontSize: "0.875rem", fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Tutup
            </button>
            <button
              onClick={() => { window.location.href = `/apply?program=${program.id}`; }}
              style={{
                flex: 2, padding: "12px 20px", borderRadius: 12, border: "none",
                background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                color: "#0a1020", fontSize: "0.875rem", fontWeight: 800,
                cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", gap: 7,
                boxShadow: `0 4px 20px ${accent}44`,
              }}
            >
              Mohon Sekarang <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
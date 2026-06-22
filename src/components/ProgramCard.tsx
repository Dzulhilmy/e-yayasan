"use client";
import { useState } from "react";
import EligibilityModal from "./EligibilityModal";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock, Wallet, Tag } from "lucide-react";

type Program = {
  id: string;
  icon: React.ComponentType<{ size?: number; color?: string; style?: React.CSSProperties }>;
  color: string;
  bg?: string;
  category?: string;
  tag?: string;
  title: string;
  desc?: string;
  amount?: string;
  deadline?: string;
  href?: string;
};

export default function ProgramCard({ program }: { program: Program }) {
  const [open, setOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [hovered, setHovered] = useState(false);
  const router = useRouter();
  const Icon = program.icon;

  const handleCheck = async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/auth/user");
      if (!res.ok) { router.push("/login"); return; }
      const payload = await res.json();
      if (payload.user) setOpen(true);
      else router.push("/login");
    } catch (err) {
      console.error(err);
      router.push("/login");
    } finally {
      setChecking(false);
    }
  };

  return (
    <>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "relative",
          borderRadius: 20,
          padding: "1px",
          background: hovered
            ? `linear-gradient(135deg, ${program.color}88, ${program.color}22, transparent)`
            : `linear-gradient(135deg, ${program.color}22, transparent)`,
          transition: "background 0.35s ease",
        }}
      >
        {/* Card body */}
        <div
          style={{
            borderRadius: 19,
            background: "linear-gradient(160deg, #0d1e33 0%, #0a1626 100%)",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 0,
            height: "100%",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Accent glow top-right */}
          <div
            style={{
              position: "absolute",
              top: -30,
              right: -30,
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: program.color,
              opacity: hovered ? 0.08 : 0.04,
              filter: "blur(40px)",
              transition: "opacity 0.35s ease",
              pointerEvents: "none",
            }}
          />

          {/* Top row: icon + tag */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 14,
                background: program.bg ?? `${program.color}18`,
                border: `1.5px solid ${program.color}30`,
                display: "grid",
                placeContent: "center",
              }}
            >
              <Icon size={22} color={program.color} />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: "0.68rem",
                fontWeight: 700,
                padding: "5px 11px",
                borderRadius: 999,
                background: `${program.color}14`,
                color: program.color,
                border: `1px solid ${program.color}28`,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              }}
            >
              <Tag size={9} />
              {program.tag}
            </div>
          </div>

          {/* Category label */}
          <div
            style={{
              fontSize: "0.68rem",
              fontWeight: 800,
              color: program.color,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: 7,
              opacity: 0.85,
            }}
          >
            {program.category}
          </div>

          {/* Title */}
          <h2
            style={{
              fontSize: "0.975rem",
              fontWeight: 800,
              lineHeight: 1.45,
              color: "#f0f6ff",
              margin: "0 0 12px",
              letterSpacing: "-0.01em",
            }}
          >
            {program.title}
          </h2>

          {/* Description */}
          <p
            style={{
              color: "#7a95b8",
              fontSize: "0.845rem",
              lineHeight: 1.75,
              margin: "0 0 22px",
              flexGrow: 1,
            }}
          >
            {program.desc}
          </p>

          {/* Amount + Deadline row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                padding: "11px 14px",
                borderRadius: 12,
                background: `${program.color}0e`,
                border: `1px solid ${program.color}22`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: "0.65rem",
                  color: "#5a789a",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 5,
                }}
              >
                <Wallet size={10} color={program.color} /> Amaun
              </div>
              <div style={{ fontWeight: 800, color: program.color, fontSize: "0.82rem", lineHeight: 1.3 }}>
                {program.amount}
              </div>
            </div>

            <div
              style={{
                padding: "11px 14px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: "0.65rem",
                  color: "#5a789a",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 5,
                }}
              >
                <Clock size={10} /> Tutup
              </div>
              <div style={{ fontWeight: 700, color: "#c8daf0", fontSize: "0.82rem", lineHeight: 1.3 }}>
                {program.deadline}
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleCheck}
            disabled={checking}
            style={{
              width: "100%",
              padding: "13px 20px",
              borderRadius: 12,
              border: "none",
              background: hovered
                ? `linear-gradient(135deg, ${program.color}, ${program.color}cc)`
                : `linear-gradient(135deg, ${program.color}dd, ${program.color}aa)`,
              color: "#0a1020",
              fontSize: "0.875rem",
              fontWeight: 800,
              cursor: checking ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              letterSpacing: "0.01em",
              transition: "background 0.25s ease, transform 0.15s ease, box-shadow 0.25s ease",
              transform: hovered ? "translateY(-1px)" : "none",
              boxShadow: hovered ? `0 6px 24px ${program.color}44` : "none",
              opacity: checking ? 0.7 : 1,
            }}
          >
            {checking ? "Mengecek…" : "Semak Kelayakan"}
            {!checking && <ArrowRight size={15} />}
          </button>
        </div>
      </div>

      <EligibilityModal
        open={open}
        onClose={() => setOpen(false)}
        program={program}
      />
    </>
  );
}
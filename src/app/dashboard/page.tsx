"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Bell,
  TrendingUp,
  FileText,
  Calendar,
  User,
  Download,
  Eye,
  BarChart3,
} from "lucide-react";

const applications = [
  {
    id: "YP-2026-001234",
    program: "Insentif Siswa (INSISYP)",
    type: "Pendidikan",
    date: "15 Mac 2026",
    status: "approved",
    statusLabel: "Diluluskan",
    steps: [
      { label: "Permohonan Diterima", done: true, date: "15 Mac" },
      { label: "Semakan Dokumen", done: true, date: "18 Mac" },
      { label: "Penilaian Kelayakan", done: true, date: "22 Mac" },
      { label: "Keputusan", done: true, date: "28 Mac" },
    ],
    amount: "RM 3,000",
  },
  {
    id: "YP-2026-001891",
    program: "Bantuan Sara Diri Mahasiswa",
    type: "Kecemasan",
    date: "3 Mei 2026",
    status: "processing",
    statusLabel: "Dalam Proses",
    steps: [
      { label: "Permohonan Diterima", done: true, date: "3 Mei" },
      { label: "Semakan Dokumen", done: true, date: "5 Mei" },
      { label: "Penilaian Kelayakan", done: false, date: "—" },
      { label: "Keputusan", done: false, date: "—" },
    ],
    amount: "RM 500",
  },
  {
    id: "YP-2025-008831",
    program: "TASPENDIK",
    type: "Pendidikan",
    date: "10 Jan 2025",
    status: "approved",
    statusLabel: "Aktif",
    steps: [
      { label: "Permohonan Diterima", done: true, date: "10 Jan" },
      { label: "Semakan Dokumen", done: true, date: "12 Jan" },
      { label: "Penilaian Kelayakan", done: true, date: "15 Jan" },
      { label: "Keputusan", done: true, date: "20 Jan" },
    ],
    amount: "RM 1,200/tahun",
  },
];

const notifications = [
  {
    icon: CheckCircle,
    color: "var(--green)",
    text: "Permohonan INSISYP anda diluluskan!",
    time: "2 jam lalu",
    unread: true,
  },
  {
    icon: Clock,
    color: "var(--gold)",
    text: "Penilaian Sara Diri sedang diproses.",
    time: "Semalam",
    unread: true,
  },
  {
    icon: Bell,
    color: "var(--teal)",
    text: "Pengumuman: Biasiswa Menteri Besar SPM 2026 dibuka.",
    time: "3 hari lalu",
    unread: false,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "submitted":
      return "var(--teal)";
    case "processing":
      return "var(--gold)";
    case "approved":
      return "var(--green)";
    case "rejected":
      return "var(--red)";
    default:
      return "var(--text-muted)";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "submitted":
      return "Dihantar";
    case "processing":
      return "Dalam Proses";
    case "approved":
      return "Diluluskan";
    case "rejected":
      return "Ditolak";
    default:
      return status;
  }
};

const getSteps = (app: any) => {
  // If explicit steps provided by API, prefer them (assumed normalized)
  if (Array.isArray(app.steps) && app.steps.length) return app.steps;

  const fmt = (d?: string | null) =>
    d
      ? new Date(d).toLocaleDateString("ms-MY", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

  const created = app.created_at ? fmt(app.created_at) : "—";
  const reviewed = app.reviewed_at ? fmt(app.reviewed_at) : null;
  const updated = app.updated_at ? fmt(app.updated_at) : null;
  const status = (app.status || "").toLowerCase();

  // Define four chronology steps in Bahasa Malaysia
  const steps = [
    { label: "Dihantar", done: true, date: created },
    {
      label: "Disemak",
      done: status !== "submitted",
      date: reviewed ?? (status !== "submitted" ? (updated ?? "Selesai") : "—"),
    },
    {
      label: "Menunggu Kelulusan",
      done: status === "approved" || status === "rejected",
      date:
        status === "approved" || status === "rejected"
          ? (updated ?? "Selesai")
          : status === "processing"
            ? (updated ?? "Sedang Menunggu")
            : "—",
    },
    {
      label: "Diluluskan",
      done: status === "approved",
      date: status === "approved" ? (updated ?? "Selesai") : "—",
    },
  ];

  return steps;
};

const getProgramType = (app: any) => {
  if (app.type) return app.type;
  return "Yayasan Perak";
};

export default function DashboardPage() {
  const [applicationsList, setApplicationsList] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [profile, setProfile] = useState<{ full_name?: string } | null>(null);
  const [showMoreModal, setShowMoreModal] = useState(false);

  const stepsList = selected ? getSteps(selected) : [];

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch("/api/auth/user", { cache: "no-store" });
        if (!res.ok) return;
        const payload = await res.json();
        if (mounted) setProfile(payload.profile ?? null);
      } catch (err) {
        // ignore
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);
  useEffect(() => {
    let mounted = true;
    const loadApps = async () => {
      try {
        const r = await fetch("/api/applications/list", { cache: "no-store" });
        if (!r.ok) return;
        const p = await r.json();
        if (!mounted) return;
        const list = p.data ?? [];
        setApplicationsList(list);
        setSelected(list[0] ?? null);
        // show modal if more than 3
        if (list.length > 3) setShowMoreModal(true);
        // if we have a recently submitted ref in sessionStorage, bring it to top
        try {
          const lastRef = window.sessionStorage.getItem("lastApplicationRef");
          if (lastRef) {
            const idx = list.findIndex((x: any) => x.ref === lastRef);
            if (idx > -1) {
              const item = list.splice(idx, 1)[0];
              list.unshift(item);
              setApplicationsList([...list]);
              setSelected(item);
              window.sessionStorage.removeItem("lastApplicationRef");
            }
          }
        } catch (e) {}
      } catch (err) {
        // ignore
      }
    };
    loadApps();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-bg" />
        <div className="container">
          <div className="section-label">
            <BarChart3 size={16} /> MyStatus Dashboard
          </div>
          <h1 className="heading-lg" style={{ marginTop: 12 }}>
            Selamat Datang,{" "}
            <span className="gradient-text">
              {profile?.full_name || "Pengguna"}
            </span>
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              marginTop: 8,
              fontSize: "1rem",
            }}
          >
            Pantau semua permohonan bantuan anda dalam satu papan pemuka.
          </p>
        </div>
      </div>

      <div className="container section-sm">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: 20,
            marginBottom: 40,
          }}
        >
          {[
            {
              label: "Permohonan Aktif",
              value: "3",
              icon: FileText,
              color: "var(--gold)",
            },
            {
              label: "Diluluskan",
              value: "2",
              icon: CheckCircle,
              color: "var(--green)",
            },
            {
              label: "Dalam Proses",
              value: "1",
              icon: Clock,
              color: "var(--teal)",
            },
            {
              label: "Jumlah Bantuan",
              value: "RM 4,200",
              icon: TrendingUp,
              color: "var(--purple)",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="card"
              style={{ display: "flex", alignItems: "center", gap: 16 }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: `${s.color}18`,
                  border: `1px solid ${s.color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <s.icon size={22} style={{ color: s.color }} />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "Plus Jakarta Sans,sans-serif",
                    fontWeight: 800,
                    fontSize: "1.5rem",
                    color: s.color,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}
                >
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 24 }}
        >
          {/* Application List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h2 className="heading-sm" style={{ marginBottom: 4 }}>
              Senarai Permohonan
            </h2>
            {applicationsList.map((app) => (
              <button
                key={app.id}
                onClick={() => setSelected(app)}
                style={{
                  textAlign: "left",
                  width: "100%",
                  padding: "20px",
                  borderRadius: "var(--radius)",
                  background:
                    selected?.id === app.id
                      ? "var(--navy-light)"
                      : "var(--navy-card)",
                  border:
                    selected?.id === app.id
                      ? `1px solid ${getStatusColor(app.status)}`
                      : "1px solid var(--border)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--text-secondary)",
                      fontFamily: "monospace",
                    }}
                  >
                    {app.ref ?? app.reference_number ?? ""}
                  </div>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      padding: "3px 10px",
                      borderRadius: 999,
                      background: `${getStatusColor(app.status)}22`,
                      color: getStatusColor(app.status),
                      border: `1px solid ${getStatusColor(app.status)}`,
                    }}
                  >
                    {getStatusLabel(app.status)}
                  </span>
                </div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "0.92rem",
                    marginBottom: 6,
                    color: "var(--text-primary)",
                  }}
                >
                  {app.program}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}
                  >
                    {app.created_at
                      ? new Date(app.created_at).toLocaleDateString("ms-MY")
                      : "-"}
                  </span>
                  <span
                    style={{
                      color: "var(--gold)",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                    }}
                  >
                    {app.amount ?? "-"}
                  </span>
                </div>
              </button>
            ))}

            {applicationsList.length === 0 && (
              <div style={{ padding: 24, color: "var(--text-muted)" }}>
                Tiada permohonan ditemui.
              </div>
            )}

            <Link
              href="/apply"
              className="btn btn-primary"
              style={{ justifyContent: "center", marginTop: 4 }}
            >
              + Permohonan Baharu
            </Link>
          </div>

          {/* More modal: show when there are more than 3 items */}
          {showMoreModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                display: "grid",
                placeItems: "center",
                zIndex: 60,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.4)",
                }}
                onClick={() => setShowMoreModal(false)}
              />
              <div
                style={{
                  width: "min(920px, 96%)",
                  background: "var(--navy-card)",
                  borderRadius: 12,
                  padding: 18,
                  zIndex: 70,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <h3 style={{ margin: 0 }}>Permohonan Lain</h3>
                  <button
                    className="btn btn-ghost"
                    onClick={() => setShowMoreModal(false)}
                  >
                    Tutup
                  </button>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {applicationsList.slice(3).map((app) => (
                    <div
                      key={app.id}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        background: "var(--navy-mid)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700 }}>{app.program}</div>
                        <div
                          style={{
                            color: "var(--text-muted)",
                            fontSize: "0.9rem",
                          }}
                        >
                          {app.ref}
                        </div>
                      </div>
                      <div style={{ color: "var(--gold)", fontWeight: 700 }}>
                        {app.amount ?? "-"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Detail Panel */}
          <div>
            {selected ? (
              <div className="card" style={{ marginBottom: 24 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 24,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                        fontFamily: "monospace",
                        marginBottom: 6,
                      }}
                    >
                      {selected?.ref ?? selected?.id}
                    </div>
                    <h2
                      style={{
                        fontFamily: "Plus Jakarta Sans,sans-serif",
                        fontWeight: 700,
                        fontSize: "1.2rem",
                      }}
                    >
                      {selected.program}
                    </h2>
                    <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                      <span className="badge badge-blue">{selected.type}</span>
                      <span
                        className="badge"
                        style={{
                          background: `${getStatusColor(selected.status)}22`,
                          color: getStatusColor(selected.status),
                          border: `1px solid ${getStatusColor(selected.status)}`,
                        }}
                      >
                        {getStatusLabel(selected.status)}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontFamily: "Plus Jakarta Sans,sans-serif",
                        fontWeight: 800,
                        fontSize: "1.6rem",
                        color: "var(--gold)",
                      }}
                    >
                      {selected.amount}
                    </div>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      Amaun Bantuan
                    </div>
                  </div>
                </div>

                {/* Progress Tracker */}
                <h3
                  style={{
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 20,
                  }}
                >
                  Penjejak Kemajuan
                </h3>
                <div style={{ position: "relative" }}>
                  {stepsList.map((step: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 16,
                        paddingBottom: i < stepsList.length - 1 ? 28 : 0,
                        position: "relative",
                      }}
                    >
                      {/* Connector */}
                      {i < stepsList.length - 1 && (
                        <div
                          style={{
                            position: "absolute",
                            left: 15,
                            top: 32,
                            width: 2,
                            height: 28,
                            background: step.done
                              ? "var(--green)"
                              : "var(--border)",
                          }}
                        />
                      )}
                      {/* Icon */}
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: step.done
                            ? "rgba(16,185,129,0.2)"
                            : "var(--navy-light)",
                          border: `2px solid ${step.done ? "var(--green)" : "var(--border)"}`,
                        }}
                      >
                        {step.done ? (
                          <CheckCircle
                            size={16}
                            style={{ color: "var(--green)" }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: "var(--border)",
                            }}
                          />
                        )}
                      </div>
                      <div style={{ flex: 1, paddingTop: 4 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "0.92rem",
                            color: step.done
                              ? "var(--text-primary)"
                              : "var(--text-muted)",
                          }}
                        >
                          {step.label}
                        </div>
                        <div
                          style={{
                            fontSize: "0.78rem",
                            color: "var(--text-muted)",
                            marginTop: 2,
                          }}
                        >
                          {step.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    height: 1,
                    background: "var(--border)",
                    margin: "24px 0",
                  }}
                />
                {/* Document actions removed: buttons were not wired to any handlers */}
              </div>
            ) : (
              <div
                className="card"
                style={{
                  marginBottom: 24,
                  padding: 24,
                  color: "var(--text-muted)",
                }}
              >
                Tiada permohonan dipilih.
              </div>
            )}

            {/* Notifications Panel */}
            <div className="card">
              <h3
                style={{
                  fontWeight: 700,
                  fontSize: "0.96rem",
                  marginBottom: 18,
                }}
              >
                <Bell size={18} style={{ marginRight: 8 }} /> Pemberitahuan
                Terkini
              </h3>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {notifications.map((n, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 14,
                      padding: "12px 14px",
                      borderRadius: 10,
                      background: n.unread
                        ? "rgba(245,166,35,0.05)"
                        : "transparent",
                      border: `1px solid ${n.unread ? "rgba(245,166,35,0.15)" : "transparent"}`,
                    }}
                  >
                    <n.icon
                      size={18}
                      style={{ color: n.color, flexShrink: 0, marginTop: 2 }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "0.86rem", lineHeight: 1.5 }}>
                        {n.text}
                      </p>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                          marginTop: 4,
                        }}
                      >
                        {n.time}
                      </p>
                    </div>
                    {n.unread && (
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "var(--gold)",
                          flexShrink: 0,
                          marginTop: 6,
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* Responsive adjustments to ensure detail panel is visible on mobile */
        @media (max-width: 900px) {
          /* Stack the two-column main area into a single column */
          .container.section-sm > div:nth-child(2) { grid-template-columns: 1fr !important; }
          /* Keep the top metrics grid two columns on medium screens */
          .container.section-sm > div:nth-child(1) { grid-template-columns: 1fr 1fr !important; }

          /* Make sure list (first column) and detail (second column) flow vertically */
          .container.section-sm > div:nth-child(2) { display: grid; grid-template-columns: 1fr; }
          .container.section-sm > div:nth-child(2) > div:nth-child(1) { order: 1; }
          .container.section-sm > div:nth-child(2) > div:nth-child(2) { order: 2; }
        }

        @media (max-width: 600px) {
          /* Collapse metrics to single column on small screens */
          .container.section-sm > div:nth-child(1) { grid-template-columns: 1fr !important; }

          /* Keep list above detail on very small screens to avoid overlap/confusion */
          .container.section-sm > div:nth-child(2) { display: grid; grid-template-columns: 1fr; }
          .container.section-sm > div:nth-child(2) > div:nth-child(1) { order: 1; }
          .container.section-sm > div:nth-child(2) > div:nth-child(2) { order: 2; }
        }
      `}</style>
    </>
  );
}

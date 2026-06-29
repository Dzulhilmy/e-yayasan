"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  Download,
  CheckCircle,
  XCircle,
  FileText,
  Trash2,
} from "lucide-react";

type AppRow = any;

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "approved" | "rejected" | "pending"
  >("all");
  const [selected, setSelected] = useState<AppRow | null>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/auth/is-admin");
        const j = await r.json();
        if (!j.isAdmin) {
          router.push("/login");
          return;
        }
      } catch (e) {
        console.error(e);
        router.push("/login");
        return;
      }
      loadApps();
    })();
  }, []);

  async function loadApps() {
    setLoading(true);
    try {
      const res = await fetch("/api/applications/admin/list");
      if (!res.ok) return;
      const json = await res.json();
      setApps(json.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function filtered() {
    if (filter === "all") return apps;
    if (filter === "approved")
      return apps.filter(
        (a) =>
          (a.status || "").toLowerCase().includes("lulus") ||
          (a.status || "").toLowerCase().includes("approved") ||
          (a.status || "").toLowerCase().includes("diluluskan"),
      );
    if (filter === "rejected")
      return apps.filter(
        (a) =>
          (a.status || "").toLowerCase().includes("tolak") ||
          (a.status || "").toLowerCase().includes("rejected"),
      );
    return apps.filter(
      (a) =>
        !["approved", "diluluskan", "rejected", "ditolak"].some((s) =>
          (a.status || "").toLowerCase().includes(s),
        ),
    );
  }

  async function loadDocsFor(app: AppRow) {
    setDocs([]);
    if (!app?.user_id) return;
    try {
      const res = await fetch(
        `/api/applications/admin/documents?user_id=${app.user_id}`,
      );
      if (!res.ok) return;
      const json = await res.json();
      setDocs(json.data ?? []);
    } catch (e) {
      console.error(e);
    }
  }

  async function openSigned(file_path: string) {
    try {
      const res = await fetch("/api/vault/admin/signed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_path }),
      });
      if (!res.ok) return;
      const { url } = await res.json();
      if (url) window.open(url, "_blank");
    } catch (e) {
      console.error(e);
    }
  }

  async function deleteApplication(appId: string) {
    if (
      !confirm(
        "Padam permohonan ditolak ini? Tindakan ini tidak boleh dibatalkan.",
      )
    )
      return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/applications/admin/delete?id=${appId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        console.error("delete failed", await res.text());
        return;
      }
      setApps((prev) => prev.filter((app) => app.id !== appId));
      if (selected?.id === appId) {
        setSelected(null);
        setDocs([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  }

  async function deleteAllRejected() {
    if (
      !confirm(
        "Padam semua permohonan ditolak? Tindakan ini akan mengosongkan semua rekod ditolak di dalam pangkalan data.",
      )
    )
      return;
    setDeleting(true);
    try {
      const res = await fetch("/api/applications/admin/delete?bulk=true", {
        method: "DELETE",
      });
      if (!res.ok) {
        console.error("bulk delete failed", await res.text());
        return;
      }
      setApps((prev) =>
        prev.filter((app) => {
          const status = (app.status || "").toString().toLowerCase();
          return !status.includes("tolak") && !status.includes("rejected");
        }),
      );
      setSelected((s) => {
        if (!s) return s;
        const status = (s.status || "").toString().toLowerCase();
        return status.includes("tolak") || status.includes("rejected")
          ? null
          : s;
      });
      setDocs([]);
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  }

  async function updateStatus(appId: string, status: string) {
    try {
      const res = await fetch("/api/applications/admin/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appId, status }),
      });
      if (!res.ok) {
        console.error("update failed", await res.text());
        return;
      }
      const json = await res.json();
      setApps((prev) =>
        prev.map((p) => (p.id === appId ? (json.data ?? p) : p)),
      );
      setSelected((s: any) => (s && s.id === appId ? (json.data ?? s) : s));
    } catch (e) {
      console.error(e);
    }
  }

  function statusLabel(status?: string) {
    return status ?? "Menunggu";
  }

  function formatFieldLabel(key: string) {
    const labels: Record<string, string> = {
      ic: "No. IC",
      name: "Nama",
      email: "Emel",
      phone: "Telefon",
      income: "Pendapatan",
      address: "Alamat",
      address_line: "Alamat",
      institution: "Institusi",
      full_name: "Nama Penuh",
      nric: "No. IC",
      city: "Bandar",
      state: "Negeri",
    };
    return (
      labels[key] ??
      key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    );
  }

  function renderApplicantFields(data: any) {
    if (!data || typeof data !== "object") {
      return [{ key: "data", value: String(data ?? "—") }];
    }
    return Object.entries(data).map(([key, value]) => ({
      key,
      value:
        value === null || value === undefined
          ? "—"
          : typeof value === "object"
            ? JSON.stringify(value, null, 2)
            : String(value),
    }));
  }

  function statusVariant(status?: string): "approved" | "rejected" | "pending" {
    const s = (status || "").toLowerCase();
    if (s.includes("lulus") || s.includes("approved")) return "approved";
    if (s.includes("tolak") || s.includes("rejected")) return "rejected";
    return "pending";
  }

  const statusStyles: Record<string, { bg: string; color: string }> = {
    approved: { bg: "rgba(34,197,94,0.12)", color: "#4ade80" },
    rejected: { bg: "rgba(239,68,68,0.12)", color: "#f87171" },
    pending: { bg: "rgba(245,166,35,0.12)", color: "#f5a623" },
  };

  const filterTabs: { key: typeof filter; label: string }[] = [
    { key: "all", label: "Semua" },
    { key: "pending", label: "Menunggu" },
    { key: "approved", label: "Diluluskan" },
    { key: "rejected", label: "Ditolak" },
  ];

  const list = filtered();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ── Filter tabs ── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                border: filter === tab.key ? "none" : "1px solid var(--border)",
                background: filter === tab.key ? "var(--gold)" : "transparent",
                color: filter === tab.key ? "var(--navy)" : "var(--text-muted)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filter === "rejected" && (
          <button
            onClick={deleteAllRejected}
            disabled={deleting}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid rgba(239,68,68,0.4)",
              background: "rgba(239,68,68,0.12)",
              color: "#f87171",
              cursor: "pointer",
            }}
          >
            <Trash2 size={14} /> Padam Semua Ditolak
          </button>
        )}
      </div>

      {/* ── Split layout: list (left) + detail (right) ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "340px minmax(0, 1fr)",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* LEFT — application list, scoped to its own card */}
        <div
          style={{
            background: "var(--navy-card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 10,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            maxHeight: "72vh",
            overflowY: "auto",
          }}
        >
          {loading && (
            <div
              style={{ color: "var(--text-muted)", padding: 12, fontSize: 13 }}
            >
              Memuatkan...
            </div>
          )}

          {!loading && list.length === 0 && (
            <div
              style={{ color: "var(--text-muted)", padding: 12, fontSize: 13 }}
            >
              Tiada permohonan.
            </div>
          )}

          {!loading &&
            list.map((a) => {
              const variant = statusVariant(a.status);
              const isSelected = selected?.id === a.id;
              return (
                <div
                  key={a.id}
                  onClick={() => {
                    setSelected(a);
                    loadDocsFor(a);
                  }}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    cursor: "pointer",
                    background: isSelected
                      ? "rgba(245,166,35,0.08)"
                      : "transparent",
                    border: `1px solid ${isSelected ? "rgba(245,166,35,0.35)" : "transparent"}`,
                    transition: "background 0.15s, border-color 0.15s",
                  }}
                >
                  <div
                    style={{ fontWeight: 700, fontSize: 14, color: "white" }}
                  >
                    {a.ref ?? a.reference_number ?? "—"}
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: "var(--text-muted)",
                      marginTop: 3,
                    }}
                  >
                    {a.program}
                  </div>
                  <span
                    style={{
                      display: "inline-block",
                      marginTop: 7,
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "3px 9px",
                      borderRadius: 8,
                      background: statusStyles[variant].bg,
                      color: statusStyles[variant].color,
                    }}
                  >
                    {statusLabel(a.status)}
                  </span>
                </div>
              );
            })}
        </div>

        {/* RIGHT — detail panel, fixed-position empty state (not an overlay) */}
        <div>
          {!selected && (
            <div
              style={{
                background: "var(--navy-card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 48,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                minHeight: 280,
                textAlign: "center",
              }}
            >
              <FileText
                size={32}
                style={{ color: "var(--text-muted)", opacity: 0.5 }}
              />
              <div style={{ color: "var(--text-muted)", fontSize: 14 }}>
                Pilih permohonan di sebelah kiri untuk melihat butiran.
              </div>
            </div>
          )}

          {selected && (
            <div
              style={{
                background: "var(--navy-card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {/* Header + actions */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, color: "white" }}>
                    {selected.ref ?? selected.reference_number}
                  </h2>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--text-muted)",
                      marginTop: 4,
                    }}
                  >
                    {selected.program}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => updateStatus(selected.id, "disemak")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      padding: "7px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "transparent",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                    }}
                  >
                    <CheckCircle size={14} /> Semak
                  </button>
                  <button
                    onClick={() => updateStatus(selected.id, "ditolak")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      padding: "7px 12px",
                      borderRadius: 8,
                      border: "1px solid rgba(239,68,68,0.3)",
                      background: "rgba(239,68,68,0.08)",
                      color: "#f87171",
                      cursor: "pointer",
                    }}
                  >
                    <XCircle size={14} /> Tolak
                  </button>
                  <button
                    onClick={() => updateStatus(selected.id, "diluluskan")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      padding: "7px 12px",
                      borderRadius: 8,
                      border: "1px solid rgba(34,197,94,0.3)",
                      background: "rgba(34,197,94,0.08)",
                      color: "#4ade80",
                      cursor: "pointer",
                    }}
                  >
                    <CheckCircle size={14} /> Lulus
                  </button>
                  {statusVariant(selected.status) === "rejected" && (
                    <button
                      onClick={() => deleteApplication(selected.id)}
                      disabled={deleting}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                        padding: "7px 12px",
                        borderRadius: 8,
                        border: "1px solid rgba(239,68,68,0.3)",
                        background: "rgba(239,68,68,0.08)",
                        color: "#f87171",
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={14} /> Padam
                    </button>
                  )}
                </div>
              </div>

              {/* Status banner */}
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: 10,
                  background: statusStyles[statusVariant(selected.status)].bg,
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: statusStyles[statusVariant(selected.status)].color,
                  }}
                >
                  {statusLabel(selected.status)}
                </div>
                <div
                  style={{
                    color: statusStyles[statusVariant(selected.status)].color,
                    opacity: 0.75,
                    marginTop: 4,
                    fontSize: 12.5,
                  }}
                >
                  {selected.created_at
                    ? new Date(selected.created_at).toLocaleString()
                    : ""}
                </div>
              </div>

              {/* Applicant details */}
              <div
                style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}
              >
                <h3
                  style={{ margin: "0 0 10px", fontSize: 14, color: "white" }}
                >
                  Butiran pemohon
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                  }}
                >
                  {renderApplicantFields(selected.data ?? selected).map(
                    (field) => (
                      <div
                        key={field.key}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "var(--text-secondary)",
                          }}
                        >
                          {formatFieldLabel(field.key)}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "white",
                            wordBreak: "break-word",
                            whiteSpace: field.value.includes("\n")
                              ? ("pre-wrap" as const)
                              : ("normal" as const),
                          }}
                        >
                          {field.value}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Documents */}
              <div
                style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}
              >
                <h3
                  style={{ margin: "0 0 10px", fontSize: 14, color: "white" }}
                >
                  Dokumen dilampirkan
                </h3>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {docs.length === 0 && (
                    <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
                      Tiada dokumen ditemui untuk pemohon ini.
                    </div>
                  )}
                  {docs.map((d) => (
                    <div
                      key={d.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 13,
                            color: "white",
                          }}
                        >
                          {d.name}
                        </div>
                        <div
                          style={{
                            color: "var(--text-muted)",
                            fontSize: 12,
                            marginTop: 2,
                          }}
                        >
                          {d.type} · {d.uploaded_at}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => openSigned(d.file_url)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 12,
                            padding: "5px 10px",
                            borderRadius: 6,
                            border: "1px solid var(--border)",
                            background: "transparent",
                            color: "var(--text-muted)",
                            cursor: "pointer",
                          }}
                        >
                          <Eye size={13} /> Lihat
                        </button>
                        <button
                          onClick={() => openSigned(d.file_url)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 12,
                            padding: "5px 10px",
                            borderRadius: 6,
                            border: "1px solid var(--border)",
                            background: "transparent",
                            color: "var(--text-muted)",
                            cursor: "pointer",
                          }}
                        >
                          <Download size={13} /> Muat turun
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

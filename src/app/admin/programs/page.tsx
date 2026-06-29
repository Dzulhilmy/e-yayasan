"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminPrograms() {
  const router = useRouter();
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const formatAmount = (amount: unknown) => {
    if (amount === null || amount === undefined || amount === "") {
      return "-";
    }

    const numeric = Number(amount);
    if (Number.isNaN(numeric)) {
      return "-";
    }

    return `RM ${numeric.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  useEffect(() => {
    const fetchPrograms = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        setPrograms(data);
      }
      setLoading(false);
    };
    fetchPrograms();
  }, []);

  const handleAdd = () => router.push("/admin/programs/create");
  const handleEdit = (id: string) => router.push(`/admin/programs/edit/${id}`);
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Padam program "${title}"?`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("programs").delete().eq("id", id);
    if (error) {
      toast.error("Gagal memadam program.");
      console.error("Delete error:", error);
      return;
    }
    setPrograms((prev) => prev.filter((program) => program.id !== id));
    toast.success(`Program "${title}" telah dipadam.`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", width: 300 }}>
          <Search
            size={18}
            style={{
              position: "absolute",
              left: 16,
              top: 14,
              color: "var(--text-muted)",
            }}
          />
          <input
            type="text"
            placeholder="Cari program..."
            style={{
              width: "100%",
              padding: "12px 16px 12px 42px",
              background: "var(--navy-card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              color: "#fff",
              outline: "none",
            }}
          />
        </div>
        <button
          onClick={handleAdd}
          className="btn btn-primary"
          style={{ gap: 8 }}
        >
          <Plus size={18} /> Tambah Program Baru
        </button>
      </div>

      <div
        style={{
          background: "var(--navy-card)",
          borderRadius: 20,
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
          }}
        >
          <thead>
            <tr
              style={{
                background: "var(--navy-mid)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <th
                style={{
                  padding: "16px 24px",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                }}
              >
                Program
              </th>
              <th
                style={{
                  padding: "16px 24px",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                }}
              >
                Kategori
              </th>
              <th
                style={{
                  padding: "16px 24px",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                }}
              >
                Jumlah
              </th>
              <th
                style={{
                  padding: "16px 24px",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                }}
              >
                Status
              </th>
              <th
                style={{
                  padding: "16px 24px",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                }}
              >
                Tindakan
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: 40,
                    textAlign: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  Memuatkan...
                </td>
              </tr>
            ) : programs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: 40,
                    textAlign: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  Tiada program ditemui.
                </td>
              </tr>
            ) : (
              programs.map((p, i) => (
                <tr
                  key={p.id}
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <td
                    style={{
                      padding: "16px 24px",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        overflow: "hidden",
                        flexShrink: 0,
                        background: "var(--navy-mid)",
                      }}
                    >
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "grid",
                            placeItems: "center",
                            color: "var(--text-muted)",
                            fontSize: "0.7rem",
                            textAlign: "center",
                            padding: 8,
                          }}
                        >
                          Tiada Gambar
                        </div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                        {p.title}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {p.subtitle}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <span className="badge badge-blue">{p.category}</span>
                  </td>
                  <td
                    style={{
                      padding: "16px 24px",
                      fontSize: "0.95rem",
                      color: "white",
                      fontWeight: 500,
                    }}
                  >
                    {formatAmount(p.amount)}
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    {p.is_active ? (
                      <span
                        style={{
                          color: "var(--green)",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                        }}
                      >
                        Aktif
                      </span>
                    ) : (
                      <span
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                        }}
                      >
                        Ditutup
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ display: "flex", gap: 12 }}>
                      <button
                        onClick={() => handleEdit(p.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--text-muted)",
                          cursor: "pointer",
                          padding: 4,
                        }}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--red)",
                          cursor: "pointer",
                          padding: 4,
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

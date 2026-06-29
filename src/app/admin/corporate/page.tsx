"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminCorporate() {
  const router = useRouter();
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const fetchSections = async () => {
      const { data, error } = await supabase
        .from("corporate_sections")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) {
        console.error("Fetch corporate sections error:", error);
        toast.error("Gagal memuatkan seksyen korporat.");
      } else {
        setSections(data || []);
      }
      setLoading(false);
    };
    fetchSections();
  }, [supabase]);

  const handleAdd = () => router.push("/admin/corporate/create");

  const handleEdit = (id: string) => router.push(`/admin/corporate/edit/${id}`);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Padam seksyen korporat "${title}"?`)) return;
    const { error } = await supabase
      .from("corporate_sections")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Gagal memadam seksyen.");
      console.error("Delete error:", error);
      return;
    }
    setSections((prev) => prev.filter((section) => section.id !== id));
    toast.success(`Seksyeh "${title}" telah dipadam.`);
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
        <div>
          <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 700 }}>
            Pengurusan Korporat
          </h1>
          <p style={{ margin: "8px 0 0", color: "var(--text-muted)" }}>
            Urus semua seksyen korporat dalam satu halaman.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="btn btn-primary"
          style={{ gap: 8 }}
        >
          <Plus size={18} /> Tambah Seksyen
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
                Seksyen
              </th>
              <th
                style={{
                  padding: "16px 24px",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                }}
              >
                Slug
              </th>
              <th
                style={{
                  padding: "16px 24px",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                }}
              >
                Susunan
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
                  colSpan={4}
                  style={{
                    padding: 40,
                    textAlign: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  Memuatkan...
                </td>
              </tr>
            ) : sections.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    padding: 40,
                    textAlign: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  Tiada seksyen korporat ditemui.
                </td>
              </tr>
            ) : (
              sections.map((section) => (
                <tr
                  key={section.id}
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>
                      {section.title}
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {section.subtitle || "-"}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "16px 24px",
                      fontSize: "0.9rem",
                      color: "white",
                    }}
                  >
                    {section.slug}
                  </td>
                  <td
                    style={{
                      padding: "16px 24px",
                      fontSize: "0.9rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    {section.display_order ?? "-"}
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ display: "flex", gap: 12 }}>
                      <button
                        onClick={() => handleEdit(section.id)}
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
                        onClick={() => handleDelete(section.id, section.title)}
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

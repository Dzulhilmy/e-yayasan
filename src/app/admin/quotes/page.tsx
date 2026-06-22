"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Plus, Edit2, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function AdminQuotes() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<any[]>([
    {
      id: "1",
      image_url:
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop",
      created_at: "2026-05-18T10:00:00Z",
    },
    {
      id: "2",
      image_url:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&auto=format&fit=crop",
      created_at: "2026-05-19T10:00:00Z",
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchQuotes() {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        setQuotes(data);
      }
      setLoading(false);
    }
    fetchQuotes();
  }, []);

  const handleAdd = () => router.push("/admin/quotes/create");
  const handleEdit = (id: string) => router.push(`/admin/quotes/edit/${id}`);
  const handleDelete = (id: string) => setDeleteConfirmId(id);

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("quotes")
        .delete()
        .eq("id", deleteConfirmId);

      if (error) {
        toast.error("Gagal memadam quote. Sila cuba semula.");
      } else {
        setQuotes(quotes.filter((q) => q.id !== deleteConfirmId));
        toast.success("Quote telah berjaya dipadam.");
      }
    } catch (err) {
      toast.error("Ralat semasa memadam quote.");
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
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
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 4 }}>
            Pengurusan Imej Quotes
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            Muat naik imej kata-kata ilham (quotes) yang akan dipaparkan di
            halaman utama.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="btn btn-primary"
          style={{ gap: 8 }}
        >
          <Plus size={18} /> Tambah Quote
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 24,
        }}
      >
        {loading ? (
          <div style={{ padding: 40, color: "var(--text-muted)" }}>
            Memuatkan...
          </div>
        ) : quotes.length === 0 ? (
          <div style={{ padding: 40, color: "var(--text-muted)" }}>
            Tiada imej quote ditemui.
          </div>
        ) : (
          quotes.map((quote) => (
            <div
              key={quote.id}
              style={{
                background: "var(--navy-card)",
                borderRadius: 16,
                border: "1px solid var(--border)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1/1",
                  background: "var(--navy-mid)",
                  position: "relative",
                }}
              >
                {quote.image_url ? (
                  <img
                    src={quote.image_url}
                    alt="Quote"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      color: "var(--text-muted)",
                    }}
                  >
                    <ImageIcon size={32} opacity={0.5} />
                  </div>
                )}
              </div>
              <div
                style={{
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderTop: "1px solid var(--border)",
                }}
              >
                <span
                  style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                >
                  {new Date(quote.created_at).toLocaleDateString("ms-MY")}
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => handleEdit(quote.id)}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      padding: 6,
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                    }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(quote.id)}
                    style={{
                      background: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      borderRadius: 8,
                      padding: 6,
                      color: "var(--red)",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              background: "var(--navy-card)",
              borderRadius: 16,
              border: "1px solid var(--border)",
              padding: 32,
              maxWidth: 400,
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                Padam Quote
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Adakah anda pasti ingin memadam quote ini? Tindakan ini tidak
                boleh dibatalkan.
              </p>
            </div>
            <div
              style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}
            >
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--text-secondary)",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  opacity: isDeleting ? 0.5 : 1,
                  fontSize: "0.9rem",
                }}
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  background: "var(--red)",
                  color: "white",
                  border: "none",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  opacity: isDeleting ? 0.7 : 1,
                  fontSize: "0.9rem",
                }}
              >
                {isDeleting ? "Lolos Padam..." : "Padam"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

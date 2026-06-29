"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

export default function EditCorporateSection() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    slug: "",
    image_url: "",
    content: "",
    display_order: "0",
  });

  useEffect(() => {
    const fetchSection = async () => {
      if (!params.id) return;
      setFetching(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("corporate_sections")
        .select("*")
        .eq("id", params.id)
        .single();
      if (!error && data) {
        setForm({
          title: data.title || "",
          subtitle: data.subtitle || "",
          slug: data.slug || "",
          image_url: data.image_url || "",
          content: data.content || "",
          display_order: String(data.display_order ?? 0),
        });
      } else {
        console.error("Fetch corporate section error:", error);
        toast.error("Gagal memuat data seksyen korporat.");
      }
      setFetching(false);
    };
    fetchSection();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!params.id) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("corporate_sections")
        .update({
          title: form.title,
          subtitle: form.subtitle,
          slug: form.slug,
          image_url: form.image_url || null,
          content: form.content,
          display_order: form.display_order
            ? parseInt(form.display_order, 10)
            : 0,
        })
        .eq("id", params.id);
      if (error) throw error;
      toast.success("Seksyeh korporat berjaya dikemas kini.");
      router.push("/admin/corporate");
    } catch (err: any) {
      console.error("Update corporate section error:", err);
      toast.error("Ralat mengemas kini seksyen korporat.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        maxWidth: 840,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={() => router.back()}
          style={{
            background: "var(--navy-card)",
            border: "1px solid var(--border)",
            borderRadius: "50%",
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700 }}>
          Sunting Seksyen Korporat
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "var(--navy-card)",
          borderRadius: 20,
          border: "1px solid var(--border)",
          padding: 32,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
        >
          <div style={{ gridColumn: "1 / -1" }}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontSize: "0.85rem",
                color: "var(--text-muted)",
              }}
            >
              Tajuk Seksyen
            </label>
            <input
              required
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Contoh: Pengenalan"
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "var(--navy-mid)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                color: "#fff",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontSize: "0.85rem",
                color: "var(--text-muted)",
              }}
            >
              Slug
            </label>
            <input
              required
              type="text"
              value={form.slug}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, slug: e.target.value }))
              }
              placeholder="contoh-pengenalan"
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "var(--navy-mid)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                color: "#fff",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontSize: "0.85rem",
                color: "var(--text-muted)",
              }}
            >
              Susunan
            </label>
            <input
              type="number"
              value={form.display_order}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, display_order: e.target.value }))
              }
              placeholder="0"
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "var(--navy-mid)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                color: "#fff",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontSize: "0.85rem",
                color: "var(--text-muted)",
              }}
            >
              Imej URL (pilihan)
            </label>
            <input
              type="url"
              value={form.image_url}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, image_url: e.target.value }))
              }
              placeholder="https://example.com/image.jpg"
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "var(--navy-mid)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                color: "#fff",
                outline: "none",
              }}
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontSize: "0.85rem",
                color: "var(--text-muted)",
              }}
            >
              Ringkasan / Subtitle
            </label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, subtitle: e.target.value }))
              }
              placeholder="Contoh: Visi dan Misi Yayasan Perak"
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "var(--navy-mid)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                color: "#fff",
                outline: "none",
              }}
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontSize: "0.85rem",
                color: "var(--text-muted)",
              }}
            >
              Kandungan
            </label>
            <textarea
              required
              rows={8}
              value={form.content}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, content: e.target.value }))
              }
              placeholder="Tulis kandungan untuk seksyen ini..."
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "var(--navy-mid)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                color: "#fff",
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>
        </div>

        <div
          style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}
        >
          <button
            disabled={loading || fetching}
            type="submit"
            className="btn btn-primary"
            style={{ gap: 8 }}
          >
            <Save size={18} /> Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}

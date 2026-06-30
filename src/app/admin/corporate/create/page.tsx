"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import ImageUpload from "@/components/ImageUpload";

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CreateCorporateSection() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    slug: "",
    image_url: "",
    content: "",
    display_order: "0",
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "title" && !form.slug) {
      setForm((prev) => ({ ...prev, slug: createSlug(value) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.from("corporate_sections").insert([
        {
          title: form.title,
          subtitle: form.subtitle,
          slug: form.slug || createSlug(form.title),
          image_url: form.image_url || null,
          content: form.content,
          display_order: form.display_order
            ? parseInt(form.display_order, 10)
            : 0,
        },
      ]);
      if (error) throw error;
      toast.success("Seksyeh korporat berjaya ditambah.");
      router.push("/admin/corporate");
    } catch (err: any) {
      console.error("Create corporate section error:", err);
      toast.error("Ralat menyimpan seksyen korporat.");
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
          Tambah Seksyen Korporat
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
              onChange={(e) => handleChange("title", e.target.value)}
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
              onChange={(e) => handleChange("slug", e.target.value)}
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
              onChange={(e) => handleChange("display_order", e.target.value)}
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

          <ImageUpload
            label="Imej Seksyen (Pilihan)"
            hint="(Gambar hiasan untuk seksyen ini)"
            value={form.image_url}
            bucket="profile-avatars"
            folder="corporate"
            onChange={(url) => handleChange("image_url", url)}
          />

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
              onChange={(e) => handleChange("subtitle", e.target.value)}
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
              onChange={(e) => handleChange("content", e.target.value)}
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
            disabled={loading}
            type="submit"
            className="btn btn-primary"
            style={{ gap: 8 }}
          >
            <Save size={18} /> Simpan Seksyen
          </button>
        </div>
      </form>
    </div>
  );
}

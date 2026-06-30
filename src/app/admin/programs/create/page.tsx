"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import ImageUpload from "@/components/ImageUpload";

export default function CreateProgram() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    category: "Pendidikan",
    description: "",
    image_url: "",
    featured_image_url: "",
    amount: "",
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const programAmount = form.amount ? parseFloat(form.amount) : null;
      const { error } = await supabase.from("programs").insert([
        {
          title: form.title,
          subtitle: form.subtitle,
          category: form.category,
          description: form.description,
          image_url: form.image_url,
          featured_image_url: form.featured_image_url || null,
          amount: programAmount,
          is_active: form.is_active,
        },
      ]);

      if (error) throw error;
      toast.success("Program berjaya ditambah!");
      router.push("/admin/programs");
    } catch (err) {
      console.error("Create program error:", err);
      toast.error("Ralat menyimpan program.");
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
        maxWidth: 800,
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
          Tambah Program Baru
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
              Nama Program
            </label>
            <input
              required
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Cth: Bantuan Khas Mahasiswa"
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
              Kategori
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "var(--navy-mid)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                color: "#fff",
                outline: "none",
              }}
            >
              <option>Pendidikan</option>
              <option>Modal Insan</option>
              <option>Keusahawanan</option>
              <option>Sosial</option>
            </select>
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
              Ringkasan / Subtajuk
            </label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              placeholder="Cth: Bantuan IPT"
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
              Status Aktif
            </label>
            <select
              value={form.is_active ? "true" : "false"}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.value === "true" })
              }
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "var(--navy-mid)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                color: "#fff",
                outline: "none",
              }}
            >
              <option value="true">Aktif</option>
              <option value="false">Tidak Aktif</option>
            </select>
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
              Jumlah Program (RM)
            </label>
            <input
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="500.00"
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
            label="Gambar Kecil Program (Admin Thumbnail)"
            hint="(Thumbnail untuk paparan senarai admin)"
            value={form.image_url}
            bucket="profile-avatars"
            folder="programs/thumbnails"
            onChange={(url) => setForm({ ...form, image_url: url })}
          />

          <ImageUpload
            label="Gambar Utama Program (Featured Image)"
            hint="(Paparan Utama Halaman Hadapan)"
            accent="#F5A623"
            value={form.featured_image_url}
            bucket="profile-avatars"
            folder="programs/featured"
            onChange={(url) => setForm({ ...form, featured_image_url: url })}
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
              Deskripsi Program
            </label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Penerangan lengkap mengenai program ini..."
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
            <Save size={18} /> Simpan Program
          </button>
        </div>
      </form>
    </div>
  );
}

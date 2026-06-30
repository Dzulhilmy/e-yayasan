"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import ImageUpload from "@/components/ImageUpload";

export default function EditProgram() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    category: "Pendidikan",
    description: "",
    image_url: "",
    featured_image_url: "",
    amount: "",
    is_active: true,
  });

  useEffect(() => {
    const fetchProgram = async () => {
      if (!params.id) return;
      setFetching(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("id", params.id)
        .single();
      if (!error && data) {
        setFormData({
          title: data.title || "",
          subtitle: data.subtitle || "",
          category: data.category || "Pendidikan",
          description: data.description || "",
          image_url: data.image_url || "",
          featured_image_url: data.featured_image_url || "",
          amount: data.amount ?? "",
          is_active: data.is_active ?? true,
        });
      } else {
        console.error("Fetch program error:", error);
        toast.error("Gagal memuat program.");
      }
      setFetching(false);
    };

    fetchProgram();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!params.id) return;
    setLoading(true);

    try {
      const supabase = createClient();
      const programAmount = formData.amount
        ? parseFloat(formData.amount)
        : null;
      const { error } = await supabase
        .from("programs")
        .update({
          title: formData.title,
          subtitle: formData.subtitle,
          category: formData.category,
          description: formData.description,
          image_url: formData.image_url,
          featured_image_url: formData.featured_image_url || null,
          amount: programAmount,
          is_active: formData.is_active,
        })
        .eq("id", params.id);

      if (error) throw error;
      toast.success("Program berjaya dikemas kini!");
      router.push("/admin/programs");
    } catch (err) {
      console.error("Update program error:", err);
      toast.error("Ralat mengemas kini program.");
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
          Sunting Program: {params.id}
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
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
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
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
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
              Status Aktif
            </label>
            <select
              value={formData.is_active ? "true" : "false"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  is_active: e.target.value === "true",
                })
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
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
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
            value={formData.image_url}
            bucket="profile-avatars"
            folder="programs/thumbnails"
            onChange={(url) => setFormData({ ...formData, image_url: url })}
          />

          <ImageUpload
            label="Gambar Utama Program (Featured Image)"
            hint="(Paparan Utama Halaman Hadapan)"
            accent="#F5A623"
            value={formData.featured_image_url}
            bucket="profile-avatars"
            folder="programs/featured"
            onChange={(url) => setFormData({ ...formData, featured_image_url: url })}
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
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
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

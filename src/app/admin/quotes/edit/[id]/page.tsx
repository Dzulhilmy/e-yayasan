"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import ImageUpload from "@/components/ImageUpload";

export default function EditQuote() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    async function fetchQuote() {
      if (!params.id) return;
      setFetching(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("quotes")
          .select("*")
          .eq("id", params.id)
          .single();

        if (error) throw error;
        if (data) {
          setImageUrl(data.image_url || "");
        }
      } catch (err: any) {
        console.error("Fetch quote error:", err);
        toast.error("Gagal memuatkan data quote.");
      } finally {
        setFetching(false);
      }
    }
    fetchQuote();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!params.id) return;
    if (!imageUrl) {
      toast.error("Sila muat naik sekeping imej.");
      return;
    }
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("quotes")
        .update({ image_url: imageUrl })
        .eq("id", params.id);

      if (error) throw error;

      toast.success("Imej Quote berjaya dikemas kini!");
      router.push("/admin/quotes");
    } catch (err: any) {
      console.error(err);
      toast.error("Ralat mengemas kini quote: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 600, margin: "0 auto" }}>
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
          Sunting Imej Quote
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
        {fetching ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
            Memuatkan...
          </div>
        ) : (
          <>
            <ImageUpload
              label="Muat Naik Imej Quote Baru"
              hint="(Gambar nisbah 1:1 digalakkan)"
              value={imageUrl}
              bucket="profile-avatars"
              folder="quotes"
              onChange={(url) => setImageUrl(url)}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button
                disabled={loading}
                type="submit"
                className="btn btn-primary"
                style={{ gap: 8, width: "100%", justifyContent: "center" }}
              >
                <Save size={18} /> Simpan Perubahan
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

"use client";
import { useRef, useState } from "react";
import { Image as ImageIcon, X, Upload } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ImageUploadProps {
  label: string;
  hint?: string;
  value: string;
  bucket: string;
  folder?: string;
  onChange: (url: string) => void;
  accent?: string;
}

export default function ImageUpload({
  label,
  hint,
  value,
  bucket,
  folder = "uploads",
  onChange,
  accent,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File) {
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true });
      if (error) {
        console.error("Upload error:", error);
        return;
      }
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(data.publicUrl);
    } finally {
      setUploading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  }

  return (
    <div style={{ gridColumn: "1 / -1" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
        <label style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{label}</label>
        {hint && (
          <span style={{ fontSize: "0.75rem", color: accent || "var(--text-muted)", fontWeight: accent ? 600 : 400 }}>{hint}</span>
        )}
      </div>

      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragOver ? (accent || "var(--gold)") : value ? "var(--green)" : "var(--border)"}`,
          borderRadius: 16,
          overflow: "hidden",
          cursor: uploading ? "wait" : "pointer",
          background: dragOver ? `${accent || "#F5A623"}10` : value ? "rgba(16,185,129,0.04)" : "var(--navy-bg)",
          transition: "all 0.2s",
          minHeight: value ? "auto" : 120,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {uploading ? (
          <div style={{ padding: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: "var(--text-muted)" }}>
            <Upload size={28} style={{ animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: "0.85rem" }}>Memuat naik...</span>
          </div>
        ) : value ? (
          <>
            <img
              src={value}
              alt="preview"
              style={{ width: "100%", maxHeight: 200, objectFit: "cover", display: "block" }}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
            <div style={{ padding: "8px 16px", background: "var(--navy-card)", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {value.split("/").pop()}
              </span>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: "0.75rem", color: "var(--green)" }}>✓ Dimuat naik</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onChange(""); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red)", padding: 2, display: "flex" }}
                  title="Padam gambar"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: "var(--text-muted)" }}>
            <ImageIcon size={28} style={{ opacity: 0.5 }} />
            <span style={{ fontWeight: 500, color: "#fff", fontSize: "0.9rem" }}>Klik atau seret gambar ke sini</span>
            <span style={{ fontSize: "0.78rem" }}>Format: JPG, PNG, WEBP · Saiz disyorkan: 1200×630</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={handleInputChange}
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

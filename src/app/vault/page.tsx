"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Upload,
  FileText,
  ShieldCheck,
  CheckCircle,
  Trash2,
  Eye,
  Download,
  FolderOpen,
  Plus,
  Lock,
  X,
  ScanSearch,
  Loader2,
  AlertCircle,
  ChevronDown,
  Save,
  Image as ImageIcon,
  FileCheck2,
} from "lucide-react";
import { toast } from "sonner";
import { scanAndDetect } from "@/utils/ocrUtils";

/* ─── constants ─── */

const docTypes = [
  "IC / MyKad",
  "Sijil Lahir",
  "Keputusan SPM/STPM",
  "Transkrip Universiti",
  "Slip Gaji",
  "Surat Tawaran IPT",
  "Lain-lain",
];

const typeColor: Record<string, string> = {
  "IC / MyKad": "var(--gold)",
  "Slip Gaji": "var(--green)",
  "Keputusan SPM/STPM": "var(--teal)",
  "Sijil Lahir": "var(--purple)",
  "Transkrip Universiti": "var(--orange)",
  "Surat Tawaran IPT": "#3b82f6",
  "Lain-lain": "var(--text-muted)",
};

/* ─── types ─── */

interface StagedFile {
  id: string;
  file: File;
  localPreviewUrl: string;
  detectedType: string;
  selectedType: string;
  confidence: number;
  ocrText: string;
  ocrStatus: "idle" | "scanning" | "done" | "error";
  ocrProgress: number;
}

/* ─── component ─── */

export default function VaultPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ─── load existing docs ─── */
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch("/api/vault/list");
        if (!res.ok) return;
        const payload = await res.json();
        if (mounted) setDocs(payload.data ?? []);
      } catch {
        // ignore
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  /* ─── computed: which doc types are already in vault ─── */
  const uploadedTypes = new Set(docs.map((d) => d.doc_type ?? d.type));

  /* ─── load signed preview ─── */
  const loadPreview = async (docId: number) => {
    try {
      const res = await fetch("/api/vault/signed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: docId }),
      });
      if (!res.ok) return;
      const { url } = await res.json();
      setPreviewUrl(url);
      setSelectedDocId(docId);
    } catch (e) {
      console.error(e);
    }
  };

  /* ─── handle file selection ─── */
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const newStaged: StagedFile[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      localPreviewUrl: URL.createObjectURL(file),
      detectedType: "Lain-lain",
      selectedType: "Lain-lain",
      confidence: 0,
      ocrText: "",
      ocrStatus: "idle" as const,
      ocrProgress: 0,
    }));

    setStagedFiles((prev) => [...prev, ...newStaged]);

    // Temp: Disable OCR
    setStagedFiles((prev) =>
      prev.map((s) =>
        newStaged.find((n) => n.id === s.id)
          ? {
              ...s,
              ocrStatus: "done" as const,
              ocrProgress: 100,
              ocrText: "",
              detectedType: "Lain-lain",
              selectedType: "Lain-lain",
              confidence: 0,
            }
          : s
      )
    );
  }, []);

  /* ─── remove staged file ─── */
  const removeStagedFile = (id: string) => {
    setStagedFiles((prev) => {
      const target = prev.find((s) => s.id === id);
      if (target) URL.revokeObjectURL(target.localPreviewUrl);
      return prev.filter((s) => s.id !== id);
    });
  };

  /* ─── save staged files to vault ─── */
  const saveToVault = async () => {
    if (stagedFiles.length === 0) return;
    setSaving(true);

    try {
      const supabase = (await import("@/utils/supabase/client")).createClient();
      const meRes = await fetch("/api/auth/user");
      const me = meRes.ok ? await meRes.json() : null;
      const userId = me?.user?.id ?? "anon";

      for (const staged of stagedFiles) {
        try {
          const ext = staged.file.name.split(".").pop();
          const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
          const path = `${userId}/${unique}`;
          const upload = await supabase.storage
            .from("vault")
            .upload(path, staged.file, {
              cacheControl: "3600",
              upsert: false,
            });
            
          if (upload.error) {
            console.error("upload error", upload.error);
            if (upload.error.message.includes("Bucket not found")) {
              toast.error("Ralat: Bucket 'vault' tidak wujud di Supabase Storage.");
            } else {
              toast.error(`Ralat muat naik: ${upload.error.message}`);
            }
            continue;
          }
          
          const dbRes = await fetch("/api/vault/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              file_path: path,
              file_name: staged.file.name,
              size: staged.file.size,
              mime: staged.file.type,
              doc_type: staged.selectedType,
            }),
          });
          
          if (!dbRes.ok) {
            const errData = await dbRes.json().catch(() => ({}));
            console.error("DB insert error", errData);
            if (errData.error?.includes("relation") || errData.error?.includes("does not exist")) {
               toast.error("Ralat: Jadual 'documents' tidak wujud dalam database.");
            } else {
               toast.error(`Ralat simpan DB: ${errData.error || 'Unknown error'}`);
            }
            continue;
          }
          
          toast.success(`Dokumen ${staged.file.name} berjaya disimpan!`);
        } catch (err) {
          console.error(err);
          toast.error("Ralat yang tidak dijangka berlaku.");
        }
      }

      // Refresh docs list
      const r = await fetch("/api/vault/list");
      if (r.ok) setDocs((await r.json()).data ?? []);

      // Clear staged files
      stagedFiles.forEach((s) => URL.revokeObjectURL(s.localPreviewUrl));
      setStagedFiles([]);

      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("save error", err);
    } finally {
      setSaving(false);
    }
  };

  /* ─── delete doc ─── */
  const removeDocLocal = (id: number) =>
    setDocs((d) => d.filter((x) => x.id !== id));

  /* ─── drag & drop ─── */
  const [dragging, setDragging] = useState(false);

  const visibleDocs = docs;

  return (
    <div className="container section-sm">
      <div className="vault-hero">
        <div
          className="section-label"
          style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          <ShieldCheck size={16} /> Digital Vault
        </div>
        <h1 className="heading-lg" style={{ marginTop: 12 }}>
          Simpan Dokumen <span className="gradient-text">Penting Anda</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", maxWidth: 560 }}>
          Muat naik dan simpan dokumen penting sekali. Ia akan dilampirkan
          secara automatik apabila anda membuat permohonan baharu.
        </p>
      </div>

      <div className="vault-grid">
        {/* ──── Left: Document List ──── */}
        <div className="vault-list">
          <div className="vault-list-header">
            <h2 className="heading-sm">
              Dokumen Tersimpan ({visibleDocs.length})
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {visibleDocs.map((doc) => (
              <div key={doc.id} className="card vault-item">
                <div className="vault-item-left">
                  <div
                    className="icon-wrap"
                    style={{
                      background: `${typeColor[doc.doc_type ?? doc.type] || "var(--gold)"}18`,
                      border: `1px solid ${typeColor[doc.doc_type ?? doc.type] || "var(--gold)"}30`,
                    }}
                  >
                    <FileText
                      size={22}
                      style={{
                        color:
                          typeColor[doc.doc_type ?? doc.type] || "var(--gold)",
                      }}
                    />
                  </div>
                </div>
                <div className="vault-item-body">
                  <div
                    style={{ display: "flex", gap: 10, alignItems: "center" }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {doc.file_name ?? doc.name}
                    </div>
                    {(doc.is_verified ?? doc.verified) && (
                      <span className="badge badge-green">
                        <CheckCircle size={10} /> Disahkan
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "0.88rem",
                      marginTop: 6,
                    }}
                  >
                    {(doc.doc_type ?? doc.type) || "-"} ·{" "}
                    {typeof (doc.file_size ?? doc.size) === "number"
                      ? `${((doc.file_size ?? doc.size) / 1024 / 1024).toFixed(2)} MB`
                      : (doc.file_size ?? doc.size)}{" "}
                    · {doc.uploaded_at ?? doc.created_at ?? doc.date}
                  </div>
                </div>
                <div className="vault-item-actions">
                  <button
                    className="btn btn-ghost btn-sm"
                    title="Lihat"
                    onClick={() => loadPreview(doc.id)}
                  >
                    <Eye size={14} />
                  </button>

                  <button
                    className="btn btn-ghost btn-sm"
                    title="Muat Turun"
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/vault/signed", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: doc.id }),
                        });
                        if (!res.ok) {
                          console.error("signed url failed", await res.text());
                          return;
                        }
                        const { url } = await res.json();
                        if (!url) return;
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = doc.file_name ?? "";
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                      } catch (err) {
                        console.error("download error", err);
                      }
                    }}
                  >
                    <Download size={14} />
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/vault/delete", {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            id: doc.id,
                            file_path: doc.file_url ?? doc.file_path,
                          }),
                        });
                        if (res.ok) {
                          removeDocLocal(doc.id);
                        } else {
                          console.error("delete failed", await res.text());
                        }
                      } catch (err) {
                        console.error("delete error", err);
                      }
                    }}
                    title="Padam"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {visibleDocs.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: 48,
                  color: "var(--text-muted)",
                }}
              >
                <FolderOpen
                  size={40}
                  style={{ opacity: 0.3, margin: "0 auto 16px" }}
                />
                <p>Tiada dokumen dalam vault anda.</p>
              </div>
            )}
          </div>
        </div>

        {/* ──── Right: Upload Panel ──── */}
        <aside className="vault-panel">
          {/* Upload / Drop Zone */}
          <div
            className={`card vault-drop-zone ${dragging ? "vault-drop-active" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              if (e.dataTransfer.files.length > 0) {
                handleFiles(e.dataTransfer.files);
              }
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div className="drop-icon">
                <Upload size={24} />
              </div>
              <h3 style={{ marginTop: 8 }}>Seret & Lepas Dokumen</h3>
              <p style={{ color: "var(--text-muted)", marginTop: 6 }}>
                PDF, JPG, PNG (maks. 10MB)
              </p>
              <label className="btn btn-primary" style={{ marginTop: 12 }}>
                <Plus size={14} /> Pilih Fail
                <input
                  ref={fileInputRef}
                  id="vault-file-input"
                  type="file"
                  style={{ display: "none" }}
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const files = e.currentTarget?.files;
                    if (files && files.length > 0) {
                      handleFiles(files);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {/* ──── Staging Area (Preview Before Save) ──── */}
          {stagedFiles.length > 0 && (
            <div className="card vault-staging" style={{ marginTop: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <ScanSearch size={18} style={{ color: "var(--gold)" }} />
                  Pratinjau & Imbasan
                </h3>
                <span
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--text-muted)",
                    background: "var(--surface-2)",
                    padding: "4px 10px",
                    borderRadius: 20,
                  }}
                >
                  {stagedFiles.length} fail
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {stagedFiles.map((staged) => (
                  <div key={staged.id} className="vault-staged-item">
                    {/* Preview Thumbnail */}
                    <div className="vault-staged-preview">
                      {staged.file.type.startsWith("image/") ? (
                        <img
                          src={staged.localPreviewUrl}
                          alt={staged.file.name}
                          style={{
                            width: "100%",
                            height: 140,
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: 140,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(245,166,35,0.06)",
                            borderRadius: 8,
                            border: "1px solid rgba(245,166,35,0.12)",
                          }}
                        >
                          <FileText size={36} style={{ color: "var(--gold)", opacity: 0.6 }} />
                          <span
                            style={{
                              fontSize: "0.78rem",
                              color: "var(--text-muted)",
                              marginTop: 8,
                            }}
                          >
                            PDF Document
                          </span>
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        marginTop: 8,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {staged.file.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                        marginTop: 2,
                      }}
                    >
                      {(staged.file.size / 1024 / 1024).toFixed(2)} MB
                    </div>

                    {/* OCR Status */}
                    <div className="vault-ocr-section">
                      {staged.ocrStatus === "scanning" && (
                        <>
                          <div className="vault-ocr-bar-container">
                            <div
                              className="vault-ocr-bar"
                              style={{ width: `${staged.ocrProgress}%` }}
                            />
                          </div>
                          <div className="vault-ocr-label">
                            <Loader2 size={12} className="vault-spin" />
                            <span>Mengimbas dokumen... {staged.ocrProgress}%</span>
                          </div>
                        </>
                      )}

                      {staged.ocrStatus === "done" && (
                        <div className="vault-ocr-result">
                          <FileCheck2 size={14} style={{ color: "var(--green)" }} />
                          <span>
                            Dikesan:{" "}
                            <strong style={{ color: typeColor[staged.detectedType] || "var(--text-primary)" }}>
                              {staged.detectedType}
                            </strong>
                          </span>
                          {staged.confidence > 0 && (
                            <span className="vault-confidence-badge">
                              {staged.confidence}%
                            </span>
                          )}
                        </div>
                      )}

                      {staged.ocrStatus === "error" && (
                        <div className="vault-ocr-result" style={{ color: "var(--red, #ef4444)" }}>
                          <AlertCircle size={14} />
                          <span>Gagal mengimbas. Sila pilih jenis manual.</span>
                        </div>
                      )}
                    </div>

                    {/* Type Selector */}
                    <div className="vault-type-select-wrap">
                      <label
                        style={{
                          fontSize: "0.78rem",
                          color: "var(--text-muted)",
                          marginBottom: 4,
                          display: "block",
                        }}
                      >
                        Jenis Dokumen
                      </label>
                      <div style={{ position: "relative" }}>
                        <select
                          className="vault-type-select"
                          value={staged.selectedType}
                          onChange={(e) => {
                            const val = e.target.value;
                            setStagedFiles((prev) =>
                              prev.map((s) =>
                                s.id === staged.id
                                  ? { ...s, selectedType: val }
                                  : s
                              )
                            );
                          }}
                        >
                          {docTypes.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={14}
                          style={{
                            position: "absolute",
                            right: 10,
                            top: "50%",
                            transform: "translateY(-50%)",
                            pointerEvents: "none",
                            color: "var(--text-muted)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      className="vault-staged-remove"
                      onClick={() => removeStagedFile(staged.id)}
                      title="Buang"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Save / Cancel buttons */}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 18,
                  justifyContent: "flex-end",
                }}
              >
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    stagedFiles.forEach((s) => URL.revokeObjectURL(s.localPreviewUrl));
                    setStagedFiles([]);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  disabled={saving}
                >
                  <X size={14} /> Batal
                </button>
                <button
                  className="btn btn-primary vault-save-btn"
                  onClick={saveToVault}
                  disabled={saving || stagedFiles.some((s) => s.ocrStatus === "scanning")}
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="vault-spin" /> Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save size={14} /> Simpan ke Vault
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ──── Existing Document Preview ──── */}
          {previewUrl && (
            <div className="card" style={{ marginTop: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <h3 style={{ margin: 0 }}>Pratinjau Dokumen</h3>
                <button
                  onClick={() => {
                    setPreviewUrl(null);
                    setSelectedDocId(null);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                  }}
                  aria-label="Close preview"
                >
                  <X size={20} />
                </button>
              </div>
              <iframe
                src={previewUrl}
                style={{
                  width: "100%",
                  height: "400px",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                }}
              />
            </div>
          )}

          {/* ──── Document Type Checklist ──── */}
          <div className="card" style={{ marginTop: 16 }}>
            <h3 style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <FileCheck2 size={16} style={{ color: "var(--gold)" }} />
              Senarai Dokumen
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {docTypes.map((t) => {
                const isMatched = uploadedTypes.has(t);
                const matchedCount = docs.filter(
                  (d) => (d.doc_type ?? d.type) === t
                ).length;

                return (
                  <div
                    key={t}
                    className={`vault-checklist-item ${isMatched ? "vault-checklist-matched" : "vault-checklist-unmatched"}`}
                  >
                    <div className="vault-checklist-icon">
                      {isMatched ? (
                        <CheckCircle size={16} />
                      ) : (
                        <div className="vault-checklist-circle" />
                      )}
                    </div>
                    <span className="vault-checklist-label">{t}</span>
                    {isMatched && (
                      <span className="vault-checklist-count">
                        {matchedCount}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ──── Info Card ──── */}
          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: 12,
            }}
          >
            <div style={{ display: "flex", gap: 10 }}>
              <Lock size={16} style={{ color: "var(--green)", flexShrink: 0, marginTop: 2 }} />
              <div style={{ color: "var(--green-light)", fontSize: "0.9rem" }}>
                Dokumen vault anda akan dilampirkan secara auto semasa membuat
                permohonan.
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ──── Styles ──── */}
      <style>{`
        .vault-grid { display: grid; grid-template-columns: 1fr 380px; gap: 28px; }
        .vault-hero { margin-bottom: 18px; }
        .vault-list-header { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom: 8px }
        .vault-panel .drop-icon { width:56px; height:56px; border-radius:12px; display:inline-flex; align-items:center; justify-content:center; background: rgba(245,166,35,0.08); border:1px solid rgba(245,166,35,0.12); margin:0 auto }
        .vault-item { display:flex; align-items:center; gap:16px; padding: 14px; }
        .vault-item .icon-wrap { width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center }
        .vault-item-body { flex:1; min-width:0 }
        .vault-item-actions { display:flex; gap:8px }
        .btn-danger { background: rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.12); padding:8px; border-radius:8px }

        /* ── Drop Zone ── */
        .vault-drop-zone { transition: all 0.2s ease; }
        .vault-drop-active {
          border: 2px dashed var(--gold) !important;
          background: rgba(245,166,35,0.06) !important;
          transform: scale(1.01);
        }

        /* ── Staging Area ── */
        .vault-staging { animation: vaultSlideIn 0.3s ease; }
        @keyframes vaultSlideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .vault-staged-item {
          position: relative;
          padding: 14px;
          background: var(--surface-2, rgba(255,255,255,0.03));
          border: 1px solid var(--border, rgba(255,255,255,0.08));
          border-radius: 12px;
          transition: border-color 0.2s;
        }
        .vault-staged-item:hover {
          border-color: var(--gold);
        }
        .vault-staged-remove {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: none;
          background: rgba(239,68,68,0.1);
          color: #ef4444;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .vault-staged-remove:hover {
          background: rgba(239,68,68,0.25);
          transform: scale(1.1);
        }

        /* ── OCR Progress ── */
        .vault-ocr-section { margin-top: 10px; }
        .vault-ocr-bar-container {
          width: 100%;
          height: 4px;
          background: rgba(245,166,35,0.12);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 6px;
        }
        .vault-ocr-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--gold), #f59e0b);
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        .vault-ocr-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          color: var(--gold);
        }
        .vault-ocr-result {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          color: var(--text-secondary);
        }
        .vault-confidence-badge {
          font-size: 0.72rem;
          background: rgba(16,185,129,0.12);
          color: var(--green);
          padding: 2px 8px;
          border-radius: 20px;
          font-weight: 600;
        }

        /* ── Spinner ── */
        @keyframes vaultSpin {
          to { transform: rotate(360deg); }
        }
        .vault-spin {
          animation: vaultSpin 1s linear infinite;
        }

        /* ── Type Selector ── */
        .vault-type-select-wrap { margin-top: 10px; }
        .vault-type-select {
          width: 100%;
          padding: 8px 32px 8px 12px;
          border-radius: 8px;
          border: 1px solid var(--border, rgba(255,255,255,0.1));
          background: var(--surface-1, rgba(255,255,255,0.04));
          color: var(--text-primary, #fff);
          font-size: 0.85rem;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          outline: none;
          transition: border-color 0.2s;
        }
        .vault-type-select:focus {
          border-color: var(--gold);
        }
        .vault-type-select option {
          background: var(--bg-primary, #1a1a2e);
          color: var(--text-primary, #fff);
        }

        /* ── Save Button ── */
        .vault-save-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ── Document Type Checklist ── */
        .vault-checklist-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }
        .vault-checklist-matched {
          background: rgba(16,185,129,0.08);
          border: 1px solid rgba(16,185,129,0.2);
          color: #10b981;
        }
        .vault-checklist-matched .vault-checklist-icon {
          color: #10b981;
        }
        .vault-checklist-matched .vault-checklist-label {
          color: #10b981;
          font-weight: 600;
        }
        .vault-checklist-unmatched {
          background: transparent;
          border: 1px solid var(--border, rgba(255,255,255,0.06));
          color: var(--text-muted);
        }
        .vault-checklist-unmatched .vault-checklist-icon {
          color: var(--text-muted);
          opacity: 0.4;
        }
        .vault-checklist-circle {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid currentColor;
        }
        .vault-checklist-count {
          margin-left: auto;
          font-size: 0.75rem;
          background: rgba(16,185,129,0.15);
          color: #10b981;
          padding: 2px 8px;
          border-radius: 20px;
          font-weight: 700;
        }
        .vault-checklist-label {
          flex: 1;
        }

        @media (max-width: 900px) {
          .vault-grid { grid-template-columns: 1fr; }
          .vault-panel { order: 2 }
          .vault-list { order: 1 }
          .card { width: 100%; box-sizing: border-box }
        }

        @media (max-width: 480px) {
          .vault-grid { gap: 18px }
          .vault-item { padding: 12px }
        }
      `}</style>
    </div>
  );
}

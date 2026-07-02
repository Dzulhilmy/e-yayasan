"use client";
import { useState, useEffect, useRef } from "react";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Upload,
  User,
  GraduationCap,
  FileText,
  Send,
  AlertCircle,
  Eye,
  Loader2,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  fetchProfileWithFallback,
  fetchProgramsWithRetry,
} from "@/utils/supabase/helpers";
import {
  browserNotificationsSupported,
  requestBrowserNotificationPermission,
  showBrowserNotification,
} from "@/utils/browserNotifications";

// Infer vault doc type from a required document label string
function inferVaultType(label: string): string {
  const l = label.toLowerCase();
  if (
    l.includes("ic") ||
    l.includes("mykad") ||
    l.includes("kad pengenalan") ||
    l.includes("mycard")
  )
    return "IC / MyKad";
  if (
    l.includes("sijil lahir") ||
    l.includes("birth") ||
    l.includes("kelahiran")
  )
    return "Sijil Lahir";
  if (
    l.includes("spm") ||
    l.includes("stpm") ||
    l.includes("keputusan peperiksaan") ||
    l.includes("result")
  )
    return "Keputusan SPM/STPM";
  if (l.includes("tawaran") || l.includes("offer")) return "Surat Tawaran IPT";
  if (
    l.includes("transkrip") ||
    l.includes("universiti") ||
    l.includes("ipta") ||
    l.includes("ipts") ||
    l.includes("diploma") ||
    l.includes("pelajar") ||
    l.includes("matrik") ||
    l.includes("ipt")
  )
    return "Transkrip Universiti";
  if (
    l.includes("slip gaji") ||
    l.includes("gaji") ||
    l.includes("pendapatan") ||
    l.includes("income")
  )
    return "Slip Gaji";
  return "Lain-lain";
}

const steps = [
  { label: "Program", icon: GraduationCap },
  { label: "Maklumat Diri", icon: User },
  { label: "Dokumen", icon: FileText },
  { label: "Hantar", icon: Send },
];

type VaultDoc = {
  id: string;
  name: string;
  file_url: string;
  type: string;
  uploaded_at: string;
};

export default function ApplyPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    program: "",
    name: "",
    ic: "",
    phone: "",
    email: "",
    address: "",
    income: "",
    institution: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submittedRef, setSubmittedRef] = useState("");

  // Profile loading
  const [profileLoading, setProfileLoading] = useState(true);
  const [profilePrefilled, setProfilePrefilled] = useState(false);

  // Vault documents
  const [vaultDocs, setVaultDocs] = useState<VaultDoc[]>([]);
  const [vaultLoading, setVaultLoading] = useState(false);

  // Programs from DB
  const [programs, setPrograms] = useState<
    { id: string; title: string; required_documents: string[] }[]
  >([]);
  const [programsLoading, setProgramsLoading] = useState(true);
  const [browserNotificationState, setBrowserNotificationState] = useState<
    "default" | "granted" | "denied" | "unsupported"
  >("default");

  // Direct upload states
  const [uploadingDocTypes, setUploadingDocTypes] = useState<
    Record<string, boolean>
  >({});
  const [activeUploadDocType, setActiveUploadDocType] = useState<string | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const next = () => {
    if (step < 3) setStep((s) => s + 1);
  };
  const prev = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const triggerDirectUpload = (docType: string) => {
    setActiveUploadDocType(docType);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleDirectFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeUploadDocType) return;

    const file = files[0];
    const docType = activeUploadDocType;
    setActiveUploadDocType(null); // Reset

    setUploadingDocTypes((prev) => ({ ...prev, [docType]: true }));

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("Sila log masuk untuk memuat naik dokumen.");
        return;
      }

      const ext = file.name.split(".").pop();
      const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const path = `${user.id}/${unique}`;

      const upload = await supabase.storage.from("vault").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (upload.error) {
        alert(`Gagal muat naik: ${upload.error.message}`);
        return;
      }

      const dbRes = await fetch("/api/vault/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_path: path,
          file_name: file.name,
          size: file.size,
          mime: file.type,
          doc_type: docType,
        }),
      });

      if (!dbRes.ok) {
        const errData = await dbRes.json().catch(() => ({}));
        alert(
          `Gagal simpan rekod database: ${errData.error || "Ralat tidak diketahui"}`,
        );
        return;
      }

      const resList = await fetch("/api/vault/list");
      const jsonList = await resList.json();
      if (jsonList.data) {
        setVaultDocs(jsonList.data);
      }

      alert(`Dokumen "${file.name}" berjaya disimpan ke Digital Vault!`);
    } catch (err) {
      console.error(err);
      alert("Ralat memproses fail.");
    } finally {
      setUploadingDocTypes((prev) => ({ ...prev, [docType]: false }));
    }
  };

  // ── Fetch profile on mount ──────────────────────────────────────────────────
  useEffect(() => {
    const supported = browserNotificationsSupported();
    setBrowserNotificationState(
      supported ? Notification.permission : "unsupported",
    );

    const fetchProfile = async () => {
      setProfileLoading(true);
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        try {
          const prof = await fetchProfileWithFallback(supabase, user.id);
          const addrParts = [
            prof.address_line,
            prof.postcode,
            prof.city,
            prof.state,
          ]
            .filter(Boolean)
            .map((p) => String(p).trim())
            .filter(Boolean);
          const joinedAddress = addrParts.length
            ? addrParts.join(", ")
            : (prof.address_line ?? "");

          setForm((f) => ({
            ...f,
            name: prof.full_name ?? f.name,
            ic: prof.ic_number ?? f.ic,
            email: prof.email ?? f.email,
            phone: prof.phone ?? f.phone,
            address: joinedAddress || f.address,
            institution: prof.institution ?? f.institution,
            income: prof.income ?? f.income,
          }));
          setProfilePrefilled(true);
        } catch (err) {
          // ignore prefill failures
          console.debug("Profile prefill failed", err);
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();

    // Fetch programs separately for better isolation and retries
    const fetchPrograms = async () => {
      setProgramsLoading(true);
      try {
        const supabase = createClient();
        const data = await fetchProgramsWithRetry(supabase);
        if (data) setPrograms(data as any[]);
      } catch (err) {
        console.error("Programs fetch error:", err);
      } finally {
        setProgramsLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  const handleRequestPopupPermission = async () => {
    const permission = await requestBrowserNotificationPermission();
    setBrowserNotificationState(permission);
  };

  // ── Fetch vault docs via API when reaching step 2 ──────────────────────────────
  useEffect(() => {
    if (step !== 2) return;
    const fetchVault = async () => {
      setVaultLoading(true);
      try {
        const res = await fetch("/api/vault/list");
        const json = await res.json();
        if (json.data) setVaultDocs(json.data);
      } catch (err) {
        console.error("Vault fetch error:", err);
      } finally {
        setVaultLoading(false);
      }
    };
    fetchVault();
  }, [step]);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const submit = async () => {
    if (!form.program || !form.name || !form.ic) {
      alert("Sila lengkapkan medan yang wajib sebelum menghantar");
      return;
    }
    try {
      const payload = {
        program: form.program,
        data: {
          name: form.name,
          ic: form.ic,
          phone: form.phone,
          email: form.email,
          address: (form.address || "").trim(),
          income: form.income,
          institution: form.institution,
        },
      };
      const res = await fetch("/api/applications/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        alert("Hantar gagal: " + txt);
        return;
      }
      const body = await res.json();
      const ref =
        body.application?.ref ?? `YP-${new Date().getFullYear()}-??????`;
      try {
        window.sessionStorage.setItem("lastApplicationRef", ref);
      } catch {}
      setSubmittedRef(ref);
      setSubmitted(true);
      if (browserNotificationState === "granted") {
        showBrowserNotification(
          "Permohonan dihantar",
          `Permohonan anda untuk ${form.program} telah dihantar. Nombor rujukan: ${ref}`,
        );
      }
    } catch (err) {
      console.error(err);
      alert("Hantar gagal");
      if (browserNotificationState === "granted") {
        showBrowserNotification(
          "Hantar gagal",
          "Terdapat masalah semasa menghantar permohonan. Sila cuba semula.",
        );
      }
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const selectedProgram = programs.find((p) => p.title === form.program);
  const requiredDocs: { label: string; required: boolean; docType: string }[] =
    (selectedProgram?.required_documents ?? []).map((label: string) => ({
      label,
      required: true,
      docType: inferVaultType(label),
    }));

  const getVaultDocForType = (docType: string): VaultDoc | undefined =>
    vaultDocs.find((d) => d.type === docType);

  const vaultMatchCount = requiredDocs.filter((d) =>
    getVaultDocForType(d.docType),
  ).length;

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div
        style={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              background: "rgba(16,185,129,0.15)",
              border: "2px solid var(--green)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 28px",
            }}
          >
            <CheckCircle size={44} style={{ color: "var(--green)" }} />
          </div>
          <h2 className="heading-lg" style={{ marginBottom: 16 }}>
            Permohonan <span className="gradient-text">Berjaya Dihantar!</span>
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              lineHeight: 1.7,
              marginBottom: 12,
            }}
          >
            Nombor rujukan anda:{" "}
            <strong style={{ color: "var(--gold)", fontFamily: "monospace" }}>
              {submittedRef}
            </strong>
          </p>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.9rem",
              marginBottom: 32,
            }}
          >
            Semakan akan dibuat dalam 7-14 hari bekerja. Anda akan menerima
            pemberitahuan melalui emel dan aplikasi.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a href="/dashboard" className="btn btn-primary">
              Semak Status
            </a>
            <a href="/programs" className="btn btn-ghost">
              Program Lain
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ───────────────────────────────────────────────────────────────
  return (
    <>
      <div className="page-hero">
        <div className="page-hero-bg" />
        <div className="container">
          <div className="section-label">⚡ Permohonan Pantas</div>
          <h1 className="heading-lg" style={{ marginTop: 12 }}>
            Mohon <span className="gradient-text">Bantuan Yayasan Perak</span>
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              marginTop: 8,
              fontSize: "1rem",
            }}
          >
            Isi borang digital dalam beberapa minit. Tiada PDF, tiada faks.
          </p>
        </div>
      </div>

      <div className="container section-sm">
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {/* Step Indicator */}
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 40 }}
          >
            {steps.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  flex: i < steps.length - 1 ? 1 : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        i < step
                          ? "var(--green)"
                          : i === step
                            ? "linear-gradient(135deg, var(--gold), var(--gold-dark))"
                            : "var(--navy-light)",
                      border:
                        i === step
                          ? "none"
                          : i < step
                            ? "2px solid var(--green)"
                            : "2px solid var(--border)",
                      transition: "all 0.3s",
                    }}
                  >
                    {i < step ? (
                      <CheckCircle size={20} style={{ color: "white" }} />
                    ) : (
                      <s.icon
                        size={18}
                        style={{
                          color:
                            i === step ? "var(--navy)" : "var(--text-muted)",
                        }}
                      />
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      color:
                        i === step
                          ? "var(--gold)"
                          : i < step
                            ? "var(--green)"
                            : "var(--text-muted)",
                    }}
                  >
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: 2,
                      background: i < step ? "var(--green)" : "var(--border)",
                      margin: "0 8px",
                      marginBottom: 22,
                      transition: "background 0.3s",
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Form Steps */}
          <div className="card">
            {/* STEP 0: Choose Program */}
            {step === 0 && (
              <div>
                <h2
                  style={{
                    fontFamily: "Plus Jakarta Sans,sans-serif",
                    fontWeight: 700,
                    fontSize: "1.3rem",
                    marginBottom: 6,
                  }}
                >
                  Pilih Program Bantuan
                </h2>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                    marginBottom: 28,
                  }}
                >
                  Pilih program yang anda ingin mohon. Anda boleh semak
                  kelayakan di halaman Program.
                </p>
                {programsLoading ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "20px",
                      justifyContent: "center",
                      color: "var(--text-muted)",
                    }}
                  >
                    <Loader2
                      size={18}
                      style={{ animation: "spin 1s linear infinite" }}
                    />{" "}
                    Memuatkan program...
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {programs.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => update("program", p.title)}
                        style={{
                          textAlign: "left",
                          padding: "16px 20px",
                          borderRadius: 12,
                          background:
                            form.program === p.title
                              ? "rgba(245,166,35,0.1)"
                              : "var(--navy-mid)",
                          border: `1px solid ${form.program === p.title ? "rgba(245,166,35,0.5)" : "var(--border)"}`,
                          color:
                            form.program === p.title
                              ? "var(--gold)"
                              : "var(--text-primary)",
                          fontWeight: form.program === p.title ? 600 : 400,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          transition: "all 0.2s",
                          cursor: "pointer",
                        }}
                      >
                        {p.title}
                        {form.program === p.title && (
                          <CheckCircle
                            size={18}
                            style={{ color: "var(--gold)" }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 1: Personal Info */}
            {step === 1 && (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "Plus Jakarta Sans,sans-serif",
                      fontWeight: 700,
                      fontSize: "1.3rem",
                    }}
                  >
                    Maklumat Peribadi
                  </h2>
                  {profileLoading ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      <Loader2
                        size={13}
                        style={{ animation: "spin 1s linear infinite" }}
                      />{" "}
                      Memuat profil...
                    </div>
                  ) : profilePrefilled ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: "0.78rem",
                        color: "var(--green)",
                        background: "rgba(16,185,129,0.08)",
                        border: "1px solid rgba(16,185,129,0.2)",
                        borderRadius: 20,
                        padding: "4px 10px",
                      }}
                    >
                      <CheckCircle size={12} /> Diisi dari profil anda
                    </div>
                  ) : null}
                </div>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                    marginBottom: 28,
                  }}
                >
                  Semua maklumat disimpan dengan selamat dan disulitkan.
                </p>
                {browserNotificationState !== "unsupported" && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "16px",
                      borderRadius: 14,
                      border: "1px solid var(--border)",
                      background:
                        browserNotificationState === "granted"
                          ? "rgba(16,185,129,0.08)"
                          : "rgba(245,146,39,0.08)",
                      marginBottom: 24,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color: "#fff",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                        }}
                      >
                        Pemberitahuan Pop-up
                      </div>
                      <div
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.8rem",
                        }}
                      >
                        {browserNotificationState === "granted"
                          ? "Notifikasi segera akan dipaparkan di peranti anda selepas penghantaran."
                          : browserNotificationState === "denied"
                            ? "Sila benarkan notifikasi dalam tetapan penyemak imbas anda."
                            : "Aktifkan notifikasi pop-up untuk makluman segera."}
                      </div>
                    </div>
                    {browserNotificationState !== "granted" && (
                      <button
                        onClick={handleRequestPopupPermission}
                        style={{
                          background: "var(--gold)",
                          color: "#000",
                          border: "none",
                          borderRadius: 10,
                          padding: "10px 16px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Aktifkan
                      </button>
                    )}
                  </div>
                )}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 18,
                  }}
                >
                  {[
                    {
                      key: "name",
                      label: "Nama Penuh (seperti IC)",
                      placeholder: "AHMAD FARIS BIN ISMAIL",
                    },
                    {
                      key: "ic",
                      label: "No. Kad Pengenalan",
                      placeholder: "990101-05-XXXX",
                    },
                    {
                      key: "phone",
                      label: "No. Telefon",
                      placeholder: "011-XXXXXXXX",
                    },
                    {
                      key: "email",
                      label: "Emel",
                      placeholder: "nama@emel.com",
                    },
                    {
                      key: "institution",
                      label: "Institusi Pengajian / Majikan",
                      placeholder: "UPM / Universiti Teknologi MARA",
                    },
                    {
                      key: "income",
                      label: "Pendapatan Isi Rumah (RM)",
                      placeholder: "0 – 3000",
                    },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="input-label">{f.label}</label>
                      <input
                        className="input-field"
                        placeholder={f.placeholder}
                        value={form[f.key as keyof typeof form]}
                        onChange={(e) => update(f.key, e.target.value)}
                      />
                    </div>
                  ))}
                  <div style={{ gridColumn: "1/-1" }}>
                    <label className="input-label">Alamat Tempat Tinggal</label>
                    <textarea
                      className="input-field"
                      rows={3}
                      placeholder="No. Rumah, Jalan, Taman, Poskod, Daerah, Perak"
                      value={form.address}
                      onChange={(e) => update("address", e.target.value)}
                      style={{ resize: "none" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Documents */}
            {step === 2 && (
              <div>
                <h2
                  style={{
                    fontFamily: "Plus Jakarta Sans,sans-serif",
                    fontWeight: 700,
                    fontSize: "1.3rem",
                    marginBottom: 6,
                  }}
                >
                  Muat Naik Dokumen
                </h2>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                    marginBottom: 8,
                  }}
                >
                  Dokumen dari Digital Vault anda akan auto-dilampirkan jika
                  ada.
                </p>

                {/* Vault status banner */}
                {vaultLoading ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 16px",
                      background: "var(--navy-mid)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      marginBottom: 28,
                    }}
                  >
                    <Loader2
                      size={16}
                      style={{
                        color: "var(--text-muted)",
                        flexShrink: 0,
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    <p
                      style={{
                        fontSize: "0.84rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      Memeriksa Digital Vault anda...
                    </p>
                  </div>
                ) : vaultMatchCount > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 16px",
                      background: "rgba(16,185,129,0.08)",
                      border: "1px solid rgba(16,185,129,0.2)",
                      borderRadius: 10,
                      marginBottom: 28,
                    }}
                  >
                    <CheckCircle
                      size={16}
                      style={{ color: "var(--green)", flexShrink: 0 }}
                    />
                    <p
                      style={{
                        fontSize: "0.84rem",
                        color: "var(--green-light)",
                      }}
                    >
                      {vaultMatchCount} dokumen ditemui dalam Digital Vault
                      anda. Telah dilampirkan secara automatik.
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 16px",
                      background: "rgba(245,166,35,0.06)",
                      border: "1px solid rgba(245,166,35,0.2)",
                      borderRadius: 10,
                      marginBottom: 28,
                    }}
                  >
                    <AlertCircle
                      size={16}
                      style={{ color: "var(--gold)", flexShrink: 0 }}
                    />
                    <p
                      style={{
                        fontSize: "0.84rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Tiada dokumen ditemui dalam Digital Vault. Sila muat naik
                      dokumen yang diperlukan.
                    </p>
                  </div>
                )}

                {/* Document rows */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  {requiredDocs.map((doc) => {
                    const vaultDoc = getVaultDocForType(doc.docType);
                    return (
                      <div
                        key={doc.label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "14px 18px",
                          background: "var(--navy-mid)",
                          borderRadius: 12,
                          border: `1px solid ${vaultDoc ? "rgba(16,185,129,0.3)" : "var(--border)"}`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          {vaultDoc ? (
                            <CheckCircle
                              size={18}
                              style={{ color: "var(--green)" }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: "50%",
                                border: "2px solid var(--border)",
                              }}
                            />
                          )}
                          <div>
                            <div
                              style={{ fontWeight: 500, fontSize: "0.9rem" }}
                            >
                              {doc.label}
                            </div>
                            {vaultDoc && (
                              <div
                                style={{
                                  fontSize: "0.72rem",
                                  color: "var(--text-muted)",
                                  marginTop: 2,
                                }}
                              >
                                {vaultDoc.name}
                              </div>
                            )}
                            {!doc.required && (
                              <div
                                style={{
                                  fontSize: "0.72rem",
                                  color: "var(--text-muted)",
                                }}
                              >
                                Pilihan
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Action buttons */}
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          {vaultDoc ? (
                            <>
                              <a
                                href={vaultDoc.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-ghost btn-sm"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 5,
                                  textDecoration: "none",
                                }}
                              >
                                <Eye size={13} /> Lihat
                              </a>
                              <span
                                style={{
                                  fontSize: "0.78rem",
                                  color: "var(--green)",
                                  fontWeight: 600,
                                }}
                              >
                                ✓ Dari Vault
                              </span>
                            </>
                          ) : (
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => triggerDirectUpload(doc.docType)}
                              disabled={uploadingDocTypes[doc.docType]}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                              }}
                            >
                              {uploadingDocTypes[doc.docType] ? (
                                <>
                                  <Loader2
                                    size={13}
                                    style={{
                                      animation: "spin 1s linear infinite",
                                    }}
                                  />{" "}
                                  Muat Naik...
                                </>
                              ) : (
                                <>
                                  <Upload size={13} /> Muat Naik
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: Review & Submit */}
            {step === 3 && (
              <div>
                <h2
                  style={{
                    fontFamily: "Plus Jakarta Sans,sans-serif",
                    fontWeight: 700,
                    fontSize: "1.3rem",
                    marginBottom: 6,
                  }}
                >
                  Semak & Hantar Permohonan
                </h2>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                    marginBottom: 24,
                  }}
                >
                  Sila semak semua maklumat sebelum menghantar.
                </p>
                <div
                  style={{
                    background: "var(--navy-mid)",
                    borderRadius: 12,
                    padding: "20px 22px",
                    marginBottom: 20,
                  }}
                >
                  {[
                    { label: "Program", value: form.program },
                    { label: "Nama", value: form.name },
                    { label: "No. IC", value: form.ic },
                    { label: "Telefon", value: form.phone },
                    { label: "Emel", value: form.email },
                    { label: "Institusi", value: form.institution },
                    {
                      label: "Pendapatan",
                      value: form.income ? `RM ${form.income}` : "",
                    },
                    { label: "Alamat", value: form.address },
                  ]
                    .filter((r) => r.value)
                    .map((row) => (
                      <div
                        key={row.label}
                        style={{
                          display: "flex",
                          gap: 16,
                          padding: "10px 0",
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        <span
                          style={{
                            width: 120,
                            fontSize: "0.84rem",
                            color: "var(--text-muted)",
                            flexShrink: 0,
                          }}
                        >
                          {row.label}
                        </span>
                        <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "14px 16px",
                    background: "rgba(245,166,35,0.08)",
                    border: "1px solid rgba(245,166,35,0.2)",
                    borderRadius: 10,
                    marginBottom: 24,
                  }}
                >
                  <AlertCircle
                    size={16}
                    style={{
                      color: "var(--gold)",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  />
                  <p
                    style={{
                      fontSize: "0.84rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.6,
                    }}
                  >
                    Dengan menghantar borang ini, anda mengesahkan bahawa semua
                    maklumat yang diberikan adalah benar dan lengkap. Maklumat
                    palsu boleh menyebabkan permohonan ditolak.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 32,
                paddingTop: 24,
                borderTop: "1px solid var(--border)",
              }}
            >
              <button
                className="btn btn-ghost"
                onClick={prev}
                style={{ visibility: step > 0 ? "visible" : "hidden" }}
              >
                <ChevronLeft size={16} /> Kembali
              </button>
              {step < 3 ? (
                <button
                  className="btn btn-primary"
                  onClick={next}
                  disabled={step === 0 && !form.program}
                >
                  Seterusnya <ChevronRight size={16} />
                </button>
              ) : (
                <button className="btn btn-primary" onClick={submit}>
                  <Send size={16} /> Hantar Permohonan
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleDirectFileChange}
        style={{ display: "none" }}
        accept=".pdf,.jpg,.jpeg,.png"
      />
    </>
  );
}

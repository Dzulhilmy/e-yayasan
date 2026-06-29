"use client";
import { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  CreditCard,
  Shield,
  Camera,
  CheckCircle,
  AlertCircle,
  Loader2,
  Lock,
  Bell,
  Eye,
  EyeOff,
  Save,
  LogOut,
  Trash2,
  ChevronRight,
  Key,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// ─── Tab definitions ────────────────────────────────────────────────────────
const TABS = [
  { key: "profile", label: "Maklumat Peribadi", icon: User },
  { key: "security", label: "Keselamatan", icon: Shield },
  { key: "notif", label: "Pemberitahuan", icon: Bell },
];

type Profile = {
  id: string;
  full_name: string;
  ic_number: string;
  email: string;
  phone: string;
  address_line?: string;
  postcode?: string;
  city?: string;
  state?: string;
  institution?: string;
  income?: string;
  avatar_url?: string;
};

// ─── Toast helper ────────────────────────────────────────────────────────────
function Toast({
  msg,
  type,
  onClose,
}: {
  msg: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        right: 32,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 20px",
        borderRadius: 14,
        background:
          type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
        border: `1px solid ${type === "success" ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)"}`,
        backdropFilter: "blur(16px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        animation: "fadeInUp 0.3s ease",
      }}
    >
      {type === "success" ? (
        <CheckCircle
          size={18}
          style={{ color: "var(--green)", flexShrink: 0 }}
        />
      ) : (
        <AlertCircle size={18} style={{ color: "var(--red)", flexShrink: 0 }} />
      )}
      <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{msg}</span>
    </div>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
function Avatar({
  name,
  url,
  onUpload,
}: {
  name: string;
  url?: string;
  onUpload: (f: File) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div style={{ position: "relative", width: 96, height: 96 }}>
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: "50%",
          background: url
            ? "transparent"
            : "linear-gradient(135deg, var(--gold), var(--gold-dark))",
          border: "3px solid var(--border-gold)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          boxShadow: "0 0 24px rgba(245,166,35,0.25)",
        }}
      >
        {url ? (
          <img
            src={url}
            alt={name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span
            style={{
              fontFamily: "Plus Jakarta Sans,sans-serif",
              fontWeight: 800,
              fontSize: "1.8rem",
              color: "var(--navy)",
            }}
          >
            {initials}
          </span>
        )}
      </div>
      <button
        onClick={() => ref.current?.click()}
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: 30,
          height: 30,
          borderRadius: "50%",
          background: "var(--gold)",
          border: "2px solid var(--navy)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "transform 0.2s",
        }}
        title="Tukar gambar profil"
      >
        <Camera size={13} style={{ color: "var(--navy)" }} />
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files?.[0]) onUpload(e.target.files[0]);
        }}
      />
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: any;
  title: string;
  subtitle?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        marginBottom: 28,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: "rgba(245,166,35,0.12)",
          border: "1px solid rgba(245,166,35,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={20} style={{ color: "var(--gold)" }} />
      </div>
      <div>
        <div
          style={{
            fontFamily: "Plus Jakarta Sans,sans-serif",
            fontWeight: 700,
            fontSize: "1.05rem",
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontSize: "0.82rem",
              color: "var(--text-muted)",
              marginTop: 2,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Input row ────────────────────────────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="input-label">{label}</label>
      <input
        className="input-field"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={disabled ? { opacity: 0.5, cursor: "not-allowed" } : {}}
      />
      {hint && (
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            marginTop: 6,
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

// ─── Password field ───────────────────────────────────────────────────────────
function PasswordField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="input-label">{label}</label>
      <div style={{ position: "relative" }}>
        <input
          className="input-field"
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ paddingRight: 44 }}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          style={{
            position: "absolute",
            right: 14,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
          }}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

// ─── Toggle switch ────────────────────────────────────────────────────────────
function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 999,
        background: on ? "var(--green)" : "var(--navy-light)",
        border: `1px solid ${on ? "var(--green)" : "var(--border)"}`,
        position: "relative",
        transition: "all 0.25s",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 3,
          left: on ? 22 : 3,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "white",
          transition: "left 0.25s",
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        }}
      />
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [tab, setTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  // Profile state
  const [profile, setProfile] = useState<Profile>({
    id: "",
    full_name: "",
    ic_number: "",
    email: "",
    phone: "",
    address_line: "",
    postcode: "",
    city: "",
    state: "",
    institution: "",
    income: "",
    avatar_url: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>();

  // Security state
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState({
    email_status: true,
    email_promo: false,
    push_status: true,
    push_reminder: true,
  });

  const showToast = (msg: string, type: "success" | "error" = "success") =>
    setToast({ msg, type });

  // ── Fetch profile ───────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("profiles")
          .select(
            "id, full_name, ic_number, email, phone, address_line, postcode, city, state, institution, income, avatar_url",
          )
          .eq("id", user.id)
          .single();

        if (!error && data) {
          setProfile({
            id: data.id,
            full_name: data.full_name ?? "",
            ic_number: data.ic_number ?? "",
            email: data.email ?? user.email ?? "",
            phone: data.phone ?? "",
            address_line: data.address_line ?? "",
            postcode: data.postcode ?? "",
            city: data.city ?? "",
            state: data.state ?? "",
            institution: data.institution ?? "",
            income: data.income ?? "",
            avatar_url: data.avatar_url ?? "",
          });
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Avatar preview
  const handleAvatarUpload = (file: File) => {
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // ── Save profile ────────────────────────────────────────────────────────────
  const saveProfile = async () => {
    if (!profile.full_name || !profile.ic_number) {
      showToast("Nama dan No. IC wajib diisi.", "error");
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();

      // Upload avatar if changed
      let avatar_url = profile.avatar_url;
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `avatars/${profile.id}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("profile-avatars")
          .upload(path, avatarFile, { upsert: true });
        if (!upErr) {
          const { data: urlData } = supabase.storage
            .from("profile-avatars")
            .getPublicUrl(path);
          avatar_url = urlData.publicUrl;
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          address_line: profile.address_line,
          postcode: profile.postcode,
          city: profile.city,
          state: profile.state,
          institution: profile.institution,
          income: profile.income,
          avatar_url,
        })
        .eq("id", profile.id);

      if (error) throw error;
      setProfile((p) => ({ ...p, avatar_url }));
      setAvatarFile(null);
      showToast("Profil berjaya dikemaskini!");
    } catch (err: any) {
      showToast(err.message ?? "Gagal menyimpan profil.", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Change password ─────────────────────────────────────────────────────────
  const changePassword = async () => {
    if (!pwForm.next || pwForm.next !== pwForm.confirm) {
      showToast("Kata laluan baru tidak sepadan.", "error");
      return;
    }
    if (pwForm.next.length < 8) {
      showToast("Kata laluan mestilah sekurang-kurangnya 8 aksara.", "error");
      return;
    }
    setPwSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: pwForm.next,
      });
      if (error) throw error;
      setPwForm({ current: "", next: "", confirm: "" });
      showToast("Kata laluan berjaya ditukar!");
    } catch (err: any) {
      showToast(err.message ?? "Gagal menukar kata laluan.", "error");
    } finally {
      setPwSaving(false);
    }
  };

  const upd = (k: keyof Profile) => (v: string) =>
    setProfile((p) => ({ ...p, [k]: v }));

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Hero */}
      <div className="page-hero">
        <div className="page-hero-bg" />
        <div className="container">
          <div className="section-label">
            <User size={14} /> Akaun Saya
          </div>
          <h1 className="heading-lg" style={{ marginTop: 12 }}>
            Profil <span className="gradient-text">Pengguna</span>
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              marginTop: 8,
              fontSize: "1rem",
            }}
          >
            Urus maklumat peribadi, keselamatan, dan keutamaan anda.
          </p>
        </div>
      </div>

      <div className="container section-sm">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr",
            gap: 28,
            alignItems: "start",
          }}
        >
          {/* ── Left sidebar ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Profile card */}
            <div
              className="card"
              style={{ textAlign: "center", padding: "28px 20px" }}
            >
              {loading ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "20px 0",
                  }}
                >
                  <Loader2
                    size={32}
                    style={{
                      color: "var(--gold)",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                </div>
              ) : (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: 16,
                    }}
                  >
                    <Avatar
                      name={profile.full_name || "Pengguna"}
                      url={avatarPreview ?? profile.avatar_url}
                      onUpload={handleAvatarUpload}
                    />
                  </div>
                  <div
                    style={{
                      fontFamily: "Plus Jakarta Sans,sans-serif",
                      fontWeight: 700,
                      fontSize: "1.05rem",
                      marginBottom: 4,
                    }}
                  >
                    {profile.full_name || "—"}
                  </div>
                  <div
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--text-muted)",
                      marginBottom: 14,
                    }}
                  >
                    {profile.email}
                  </div>
                  <div
                    className="badge badge-green"
                    style={{ justifyContent: "center", width: "100%" }}
                  >
                    <span className="status-dot active" /> Akaun Aktif
                  </div>

                  <div className="divider" style={{ margin: "18px 0" }} />

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      textAlign: "left",
                    }}
                  >
                    {[
                      {
                        icon: CreditCard,
                        label: "No. IC",
                        value: profile.ic_number || "—",
                      },
                      {
                        icon: Phone,
                        label: "Telefon",
                        value: profile.phone || "—",
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <row.icon
                          size={14}
                          style={{ color: "var(--text-muted)", flexShrink: 0 }}
                        />
                        <div>
                          <div
                            style={{
                              fontSize: "0.7rem",
                              color: "var(--text-muted)",
                            }}
                          >
                            {row.label}
                          </div>
                          <div style={{ fontSize: "0.84rem", fontWeight: 500 }}>
                            {row.value}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Nav */}
            <div className="card" style={{ padding: 8 }}>
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "none",
                    cursor: "pointer",
                    background:
                      tab === t.key ? "rgba(245,166,35,0.1)" : "transparent",
                    color:
                      tab === t.key ? "var(--gold)" : "var(--text-secondary)",
                    fontWeight: tab === t.key ? 600 : 400,
                    fontSize: "0.9rem",
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <t.icon size={16} />
                    {t.label}
                  </div>
                  <ChevronRight
                    size={14}
                    style={{ opacity: tab === t.key ? 1 : 0.3 }}
                  />
                </button>
              ))}
            </div>

            {/* Danger zone */}
            <div
              className="card"
              style={{
                padding: "16px 18px",
                borderColor: "rgba(239,68,68,0.2)",
              }}
            >
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  marginBottom: 12,
                }}
              >
                Zon Berbahaya
              </p>
              <button
                className="btn btn-ghost btn-sm"
                style={{
                  width: "100%",
                  color: "var(--red)",
                  borderColor: "rgba(239,68,68,0.3)",
                  justifyContent: "center",
                  gap: 8,
                }}
                onClick={async () => {
                  if (!confirm("Adakah anda pasti ingin log keluar?")) return;
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  window.location.href = "/login";
                }}
              >
                <LogOut size={14} /> Log Keluar
              </button>
            </div>
          </div>

          {/* ── Right panel ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* ── TAB: Profile ── */}
            {tab === "profile" && (
              <>
                {/* Personal info */}
                <div className="card">
                  <SectionHeader
                    icon={User}
                    title="Maklumat Peribadi"
                    subtitle="Kemaskini nama, nombor telefon, dan alamat anda."
                  />
                  {loading ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        padding: 32,
                      }}
                    >
                      <Loader2
                        size={28}
                        style={{
                          color: "var(--gold)",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 18,
                      }}
                    >
                      <Field
                        label="Nama Penuh (seperti IC)"
                        value={profile.full_name}
                        onChange={upd("full_name")}
                        placeholder="AHMAD FARIS BIN ISMAIL"
                      />
                      <Field
                        label="No. Kad Pengenalan"
                        value={profile.ic_number}
                        onChange={upd("ic_number")}
                        placeholder="990101-05-XXXX"
                        disabled
                        hint="No. IC tidak boleh ditukar. Hubungi pentadbir jika perlu."
                      />
                      <Field
                        label="No. Telefon"
                        value={profile.phone}
                        onChange={upd("phone")}
                        placeholder="011-XXXXXXXX"
                        type="tel"
                      />
                      <Field
                        label="Emel"
                        value={profile.email}
                        onChange={upd("email")}
                        placeholder="nama@emel.com"
                        type="email"
                        disabled
                        hint="Emel diurus melalui tetapan akaun."
                      />
                      <Field
                        label="Institusi Pengajian / Majikan"
                        value={profile.institution ?? ""}
                        onChange={upd("institution")}
                        placeholder="UPM / Universiti Teknologi MARA"
                      />
                      <Field
                        label="Pendapatan Isi Rumah (RM)"
                        value={profile.income ?? ""}
                        onChange={upd("income")}
                        placeholder="0 – 3000"
                      />
                      <div style={{ gridColumn: "1/-1" }}>
                        <label className="input-label">Alamat (Baris)</label>
                        <textarea
                          className="input-field"
                          rows={3}
                          placeholder="No. Rumah, Jalan, Taman"
                          value={profile.address_line ?? ""}
                          onChange={(e) => upd("address_line")(e.target.value)}
                          style={{ resize: "none" }}
                        />
                      </div>
                      <Field
                        label="Poskod"
                        value={profile.postcode ?? ""}
                        onChange={upd("postcode")}
                        placeholder="43000"
                      />
                      <Field
                        label="Bandar"
                        value={profile.city ?? ""}
                        onChange={upd("city")}
                        placeholder="Taiping"
                      />
                      <Field
                        label="Negeri"
                        value={profile.state ?? ""}
                        onChange={upd("state")}
                        placeholder="Perak"
                      />
                    </div>
                  )}
                </div>

                {/* Save button */}
                {!loading && (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      className="btn btn-primary"
                      onClick={saveProfile}
                      disabled={saving}
                      style={{ minWidth: 160 }}
                    >
                      {saving ? (
                        <>
                          <Loader2
                            size={15}
                            style={{ animation: "spin 1s linear infinite" }}
                          />{" "}
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save size={15} /> Simpan Perubahan
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ── TAB: Security ── */}
            {tab === "security" && (
              <>
                <div className="card">
                  <SectionHeader
                    icon={Key}
                    title="Tukar Kata Laluan"
                    subtitle="Pastikan kata laluan anda kuat dan unik."
                  />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 18,
                      maxWidth: 480,
                    }}
                  >
                    <PasswordField
                      label="Kata Laluan Semasa"
                      value={pwForm.current}
                      onChange={(v) => setPwForm((p) => ({ ...p, current: v }))}
                      placeholder="••••••••"
                    />
                    <PasswordField
                      label="Kata Laluan Baru"
                      value={pwForm.next}
                      onChange={(v) => setPwForm((p) => ({ ...p, next: v }))}
                      placeholder="Min. 8 aksara"
                    />
                    <PasswordField
                      label="Sahkan Kata Laluan Baru"
                      value={pwForm.confirm}
                      onChange={(v) => setPwForm((p) => ({ ...p, confirm: v }))}
                      placeholder="Ulang kata laluan baru"
                    />

                    {/* Strength indicator */}
                    {pwForm.next && (
                      <div>
                        <div
                          style={{
                            fontSize: "0.78rem",
                            color: "var(--text-muted)",
                            marginBottom: 8,
                          }}
                        >
                          Kekuatan kata laluan
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          {[1, 2, 3, 4].map((n) => {
                            const strength = Math.min(
                              4,
                              Math.floor(pwForm.next.length / 3),
                            );
                            const colors = [
                              "var(--red)",
                              "var(--orange)",
                              "var(--gold)",
                              "var(--green)",
                            ];
                            return (
                              <div
                                key={n}
                                style={{
                                  flex: 1,
                                  height: 4,
                                  borderRadius: 999,
                                  background:
                                    n <= strength
                                      ? colors[strength - 1]
                                      : "var(--navy-light)",
                                  transition: "background 0.3s",
                                }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div style={{ paddingTop: 4 }}>
                      <button
                        className="btn btn-primary"
                        onClick={changePassword}
                        disabled={pwSaving}
                        style={{ minWidth: 160 }}
                      >
                        {pwSaving ? (
                          <>
                            <Loader2
                              size={15}
                              style={{ animation: "spin 1s linear infinite" }}
                            />{" "}
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Lock size={15} /> Tukar Kata Laluan
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Active sessions */}
                <div className="card">
                  <SectionHeader
                    icon={Shield}
                    title="Sesi Aktif"
                    subtitle="Peranti yang sedang log masuk ke akaun anda."
                  />
                  {[
                    {
                      device: "Chrome • macOS",
                      location: "Ipoh, Perak",
                      time: "Sekarang",
                      current: true,
                    },
                    {
                      device: "Safari • iPhone 15",
                      location: "Ipoh, Perak",
                      time: "2 hari lalu",
                      current: false,
                    },
                  ].map((s, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 0",
                        borderBottom:
                          i === 0 ? "1px solid var(--border)" : "none",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: s.current
                              ? "rgba(16,185,129,0.1)"
                              : "var(--navy-light)",
                            border: `1px solid ${s.current ? "rgba(16,185,129,0.3)" : "var(--border)"}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Shield
                            size={18}
                            style={{
                              color: s.current
                                ? "var(--green)"
                                : "var(--text-muted)",
                            }}
                          />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                            {s.device}
                          </div>
                          <div
                            style={{
                              fontSize: "0.78rem",
                              color: "var(--text-muted)",
                              marginTop: 2,
                            }}
                          >
                            {s.location} · {s.time}
                          </div>
                        </div>
                      </div>
                      {s.current ? (
                        <span className="badge badge-green">
                          Ini peranti anda
                        </span>
                      ) : (
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{
                            color: "var(--red)",
                            borderColor: "rgba(239,68,68,0.3)",
                          }}
                        >
                          <Trash2 size={13} /> Tamat
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── TAB: Notifications ── */}
            {tab === "notif" && (
              <div className="card">
                <SectionHeader
                  icon={Bell}
                  title="Keutamaan Pemberitahuan"
                  subtitle="Pilih cara anda ingin menerima notifikasi."
                />
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 0 }}
                >
                  {[
                    {
                      key: "email_status",
                      label: "Status Permohonan",
                      sub: "Terima emel apabila status permohonan berubah.",
                      group: "Emel",
                    },
                    {
                      key: "email_promo",
                      label: "Program & Pengumuman Baru",
                      sub: "Notis program bantuan terbaru dari Yayasan Perak.",
                      group: "Emel",
                    },
                    {
                      key: "push_status",
                      label: "Status Permohonan",
                      sub: "Pemberitahuan segera pada peranti anda.",
                      group: "Tolak (Push)",
                    },
                    {
                      key: "push_reminder",
                      label: "Peringatan Dokumen",
                      sub: "Diingatkan jika dokumen perlu dikemaskini.",
                      group: "Tolak (Push)",
                    },
                  ]
                    .reduce<
                      {
                        group: string;
                        items: typeof notifPrefs extends object
                          ? any[]
                          : never[];
                      }[]
                    >((acc, item) => {
                      const existing = acc.find((g) => g.group === item.group);
                      if (existing) existing.items.push(item);
                      else acc.push({ group: item.group, items: [item] });
                      return acc;
                    }, [])
                    .map((group) => (
                      <div key={group.group} style={{ marginBottom: 28 }}>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            color: "var(--gold)",
                            marginBottom: 14,
                          }}
                        >
                          {group.group}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          {group.items.map((item: any) => (
                            <div
                              key={item.key}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "14px 16px",
                                borderRadius: 12,
                                background: "var(--navy-mid)",
                                border: "1px solid var(--border)",
                                marginBottom: 8,
                              }}
                            >
                              <div>
                                <div
                                  style={{
                                    fontWeight: 500,
                                    fontSize: "0.9rem",
                                  }}
                                >
                                  {item.label}
                                </div>
                                <div
                                  style={{
                                    fontSize: "0.78rem",
                                    color: "var(--text-muted)",
                                    marginTop: 3,
                                  }}
                                >
                                  {item.sub}
                                </div>
                              </div>
                              <Toggle
                                on={
                                  notifPrefs[
                                    item.key as keyof typeof notifPrefs
                                  ]
                                }
                                onChange={(v) =>
                                  setNotifPrefs((p) => ({
                                    ...p,
                                    [item.key]: v,
                                  }))
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        showToast("Keutamaan pemberitahuan disimpan!")
                      }
                    >
                      <Save size={15} /> Simpan Keutamaan
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 900px) {
          .profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}

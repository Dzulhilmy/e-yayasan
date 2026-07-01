"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { fetchProfileWithFallback } from "@/utils/supabase/helpers";

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
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 1000,
        background: type === "success" ? "#10B981" : "#EF4444",
        color: "#fff",
        padding: "12px 20px",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        animation: "fadeInUp 0.3s ease",
      }}
    >
      {type === "success" ? (
        <CheckCircle size={18} />
      ) : (
        <AlertCircle size={18} />
      )}
      <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{msg}</span>
    </div>
  );
}

export default function ProfilePage() {
  const supabase = createClient();

  // States
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  // Password fields state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPass, setShowPass] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  // Notification local state preference mock placeholders
  const [notifPrefs, setNotifPrefs] = useState({
    emailApp: true,
    smsApp: false,
    emailPromo: true,
  });

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
  };

  // 1. Fetch data based on logged-in user
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        // Get metadata session from Supabase auth
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          showToast("Sila log masuk untuk melihat profil.", "error");
          return;
        }

        try {
          const prof = await fetchProfileWithFallback(supabase, user.id);
          setProfile(prof as Profile);
        } catch (err) {
          // Prefill from auth metadata if DB lookup fails
          setProfile({
            id: user.id,
            full_name: user.user_metadata?.full_name || "",
            email: user.email || "",
            phone: (user as any).phone || "",
            ic_number: "",
          });
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        showToast("Ralat memproses rekod profil anda.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [supabase]);

  // 2. Persist profile mutations to database
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setIsSaving(true);
      const { error } = await supabase.from("profiles").upsert({
        ...profile,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      showToast("Maklumat peribadi berjaya dikemas kini!");
    } catch (err) {
      console.error("Save error:", err);
      showToast("Gagal menyimpan maklumat.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Password update method
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("Kata laluan baru tidak sepadan.", "error");
      return;
    }

    try {
      setIsSaving(true);
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;
      showToast("Kata laluan berjaya dikemas kini!");
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error(err);
      showToast("Gagal mengemas kini kata laluan.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          height: "80vh",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
          color: "var(--text-muted)",
        }}
      >
        <Loader2
          size={36}
          style={{ animation: "spin 1s linear infinite", color: "var(--gold)" }}
        />
        <p style={{ fontSize: "0.95rem", fontWeight: 500 }}>
          Memuatkan maklumat profil...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px",
          color: "var(--text-muted)",
        }}
      >
        <AlertCircle
          size={48}
          style={{ margin: "0 auto 16px", color: "#EF4444" }}
        />
        <p>Akses tidak sah. Sila log masuk semula.</p>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          animation: "fadeInUp 0.4s ease",
        }}
      >
        {/* Profile Header Banner Card */}
        <div
          className="card"
          style={{
            padding: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 24,
            marginBottom: 32,
            background:
              "linear-gradient(135deg, var(--navy-card) 0%, rgba(245,166,35,0.03) 100%)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              flexWrap: "wrap",
            }}
          >
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: "50%",
                  background: "var(--navy-bg)",
                  border: "2px solid var(--gold)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "var(--gold)",
                  overflow: "hidden",
                }}
              >
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  profile.full_name?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              <button
                title="Muat naik gambar"
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "var(--gold)",
                  border: "3px solid var(--navy-card)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Camera size={14} style={{ color: "#000" }} />
              </button>
            </div>
            <div>
              <h2
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 6,
                }}
              >
                {profile.full_name || "Nama Pengguna"}
              </h2>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  flexWrap: "wrap",
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Mail size={14} /> {profile.email}
                </span>
                {profile.phone && (
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <Phone size={14} /> {profile.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Layout Grid */}
        <div
          className="profile-grid"
          style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 32 }}
        >
          {/* Navigation Sidebar Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {TABS.map((tab) => {
              const IsActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 18px",
                    borderRadius: 12,
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: IsActive ? 600 : 500,
                    textAlign: "left",
                    transition: "all 0.2s",
                    background: IsActive
                      ? "rgba(245,166,35,0.12)"
                      : "transparent",
                    color: IsActive ? "var(--gold)" : "var(--text-muted)",
                  }}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Form Context Content Panels */}
          <div className="card" style={{ padding: "32px" }}>
            {/* Tab: Maklumat Peribadi */}
            {activeTab === "profile" && (
              <form onSubmit={handleUpdateProfile}>
                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color: "#fff",
                    marginBottom: 24,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <User size={18} style={{ color: "var(--gold)" }} /> Maklumat
                  Peribadi Terperinci
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: 20,
                    marginBottom: 28,
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        marginBottom: 8,
                        fontWeight: 500,
                      }}
                    >
                      Nama Penuh (Seperti dalam IC)
                    </label>
                    <input
                      type="text"
                      value={profile.full_name}
                      onChange={(e) =>
                        setProfile({ ...profile, full_name: e.target.value })
                      }
                      className="form-control"
                      style={{
                        width: "100%",
                        background: "var(--navy-bg)",
                        border: "1px solid var(--border)",
                        padding: "11px 14px",
                        borderRadius: 8,
                        color: "#fff",
                        fontSize: "0.9rem",
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        marginBottom: 8,
                        fontWeight: 500,
                      }}
                    >
                      No. Kad Pengenalan
                    </label>
                    <input
                      type="text"
                      value={profile.ic_number}
                      onChange={(e) =>
                        setProfile({ ...profile, ic_number: e.target.value })
                      }
                      className="form-control"
                      placeholder="e.g. 010203085541"
                      style={{
                        width: "100%",
                        background: "var(--navy-bg)",
                        border: "1px solid var(--border)",
                        padding: "11px 14px",
                        borderRadius: 8,
                        color: "#fff",
                        fontSize: "0.9rem",
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        marginBottom: 8,
                        fontWeight: 500,
                      }}
                    >
                      Alamat Emel (Sistem)
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      style={{
                        width: "100%",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--border)",
                        padding: "11px 14px",
                        borderRadius: 8,
                        color: "var(--text-muted)",
                        fontSize: "0.9rem",
                        cursor: "not-allowed",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        marginBottom: 8,
                        fontWeight: 500,
                      }}
                    >
                      No. Telefon Telefon Pintar
                    </label>
                    <input
                      type="text"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile({ ...profile, phone: e.target.value })
                      }
                      className="form-control"
                      style={{
                        width: "100%",
                        background: "var(--navy-bg)",
                        border: "1px solid var(--border)",
                        padding: "11px 14px",
                        borderRadius: 8,
                        color: "#fff",
                        fontSize: "0.9rem",
                      }}
                    />
                  </div>
                </div>

                <h4
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: "#fff",
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <MapPin size={16} style={{ color: "var(--gold)" }} /> Maklumat
                  Alamat Tetap
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 20,
                    marginBottom: 28,
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        marginBottom: 8,
                        fontWeight: 500,
                      }}
                    >
                      Alamat Rumah
                    </label>
                    <input
                      type="text"
                      value={profile.address_line || ""}
                      onChange={(e) =>
                        setProfile({ ...profile, address_line: e.target.value })
                      }
                      className="form-control"
                      style={{
                        width: "100%",
                        background: "var(--navy-bg)",
                        border: "1px solid var(--border)",
                        padding: "11px 14px",
                        borderRadius: 8,
                        color: "#fff",
                        fontSize: "0.9rem",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 16,
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                          marginBottom: 8,
                          fontWeight: 500,
                        }}
                      >
                        Poskod
                      </label>
                      <input
                        type="text"
                        value={profile.postcode || ""}
                        onChange={(e) =>
                          setProfile({ ...profile, postcode: e.target.value })
                        }
                        className="form-control"
                        style={{
                          width: "100%",
                          background: "var(--navy-bg)",
                          border: "1px solid var(--border)",
                          padding: "11px 14px",
                          borderRadius: 8,
                          color: "#fff",
                          fontSize: "0.9rem",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                          marginBottom: 8,
                          fontWeight: 500,
                        }}
                      >
                        Bandar
                      </label>
                      <input
                        type="text"
                        value={profile.city || ""}
                        onChange={(e) =>
                          setProfile({ ...profile, city: e.target.value })
                        }
                        className="form-control"
                        style={{
                          width: "100%",
                          background: "var(--navy-bg)",
                          border: "1px solid var(--border)",
                          padding: "11px 14px",
                          borderRadius: 8,
                          color: "#fff",
                          fontSize: "0.9rem",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                          marginBottom: 8,
                          fontWeight: 500,
                        }}
                      >
                        Negeri
                      </label>
                      <input
                        type="text"
                        value={profile.state || ""}
                        onChange={(e) =>
                          setProfile({ ...profile, state: e.target.value })
                        }
                        className="form-control"
                        style={{
                          width: "100%",
                          background: "var(--navy-bg)",
                          border: "1px solid var(--border)",
                          padding: "11px 14px",
                          borderRadius: 8,
                          color: "#fff",
                          fontSize: "0.9rem",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <h4
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: "#fff",
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Building2 size={16} style={{ color: "var(--gold)" }} /> Latar
                  Belakang Sosioekonomi / Pendidikan
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 20,
                    marginBottom: 32,
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        marginBottom: 8,
                        fontWeight: 500,
                      }}
                    >
                      Institusi / Tempat Pengajian (Jika Pelajar)
                    </label>
                    <input
                      type="text"
                      value={profile.institution || ""}
                      onChange={(e) =>
                        setProfile({ ...profile, institution: e.target.value })
                      }
                      className="form-control"
                      style={{
                        width: "100%",
                        background: "var(--navy-bg)",
                        border: "1px solid var(--border)",
                        padding: "11px 14px",
                        borderRadius: 8,
                        color: "#fff",
                        fontSize: "0.9rem",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        marginBottom: 8,
                        fontWeight: 500,
                      }}
                    >
                      Pendapatan Kasar Isi Rumah (RM)
                    </label>
                    <input
                      type="text"
                      value={profile.income || ""}
                      onChange={(e) =>
                        setProfile({ ...profile, income: e.target.value })
                      }
                      className="form-control"
                      placeholder="e.g. 3500"
                      style={{
                        width: "100%",
                        background: "var(--navy-bg)",
                        border: "1px solid var(--border)",
                        padding: "11px 14px",
                        borderRadius: 8,
                        color: "#fff",
                        fontSize: "0.9rem",
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn btn-primary"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "12px 24px",
                      background: "var(--gold)",
                      color: "#000",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {isSaving ? (
                      <Loader2
                        size={16}
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                    ) : (
                      <Save size={16} />
                    )}
                    Simpan Maklumat Peribadi
                  </button>
                </div>
              </form>
            )}

            {/* Tab: Keselamatan */}
            {activeTab === "security" && (
              <form onSubmit={handleUpdatePassword}>
                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color: "#fff",
                    marginBottom: 24,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Lock size={18} style={{ color: "var(--gold)" }} /> Kemas Kini
                  Kata Laluan Keselamatan
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 20,
                    maxWidth: 500,
                    marginBottom: 32,
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        marginBottom: 8,
                      }}
                    >
                      Kata Laluan Baharu
                    </label>
                    <input
                      type={showPass.new ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        background: "var(--navy-bg)",
                        border: "1px solid var(--border)",
                        padding: "11px 14px",
                        borderRadius: 8,
                        color: "#fff",
                        paddingRight: 40,
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPass({ ...showPass, new: !showPass.new })
                      }
                      style={{
                        position: "absolute",
                        right: 12,
                        top: 36,
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                      }}
                    >
                      {showPass.new ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div style={{ position: "relative" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        marginBottom: 8,
                      }}
                    >
                      Sahkan Kata Laluan Baharu
                    </label>
                    <input
                      type={showPass.confirm ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        background: "var(--navy-bg)",
                        border: "1px solid var(--border)",
                        padding: "11px 14px",
                        borderRadius: 8,
                        color: "#fff",
                        paddingRight: 40,
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPass({ ...showPass, confirm: !showPass.confirm })
                      }
                      style={{
                        position: "absolute",
                        right: 12,
                        top: 36,
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                      }}
                    >
                      {showPass.confirm ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="submit"
                    disabled={isSaving}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "12px 24px",
                      background: "var(--gold)",
                      color: "#000",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {isSaving ? (
                      <Loader2
                        size={16}
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                    ) : (
                      <Save size={16} />
                    )}{" "}
                    Tukar Kata Laluan
                  </button>
                </div>
              </form>
            )}

            {/* Tab: Pemberitahuan */}
            {activeTab === "notif" && (
              <div>
                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color: "#fff",
                    marginBottom: 24,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Bell size={18} style={{ color: "var(--gold)" }} /> Tetapan
                  Notifikasi Sistem
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 20,
                    marginBottom: 32,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px",
                      background: "var(--navy-bg)",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color: "#fff",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          marginBottom: 4,
                        }}
                      >
                        Notifikasi Emel Aplikasi
                      </div>
                      <div
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.8rem",
                        }}
                      >
                        Terima kemas kini status kelulusan program bantuan
                        kewangan melalui emel.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifPrefs.emailApp}
                      onChange={(e) =>
                        setNotifPrefs({
                          ...notifPrefs,
                          emailApp: e.target.checked,
                        })
                      }
                      style={{
                        width: 18,
                        height: 18,
                        accentColor: "var(--gold)",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px",
                      background: "var(--navy-bg)",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color: "#fff",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          marginBottom: 4,
                        }}
                      >
                        Pemberitahuan SMS Kilat
                      </div>
                      <div
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.8rem",
                        }}
                      >
                        Hantar mesej ringkas terus ke peranti mudah alih apabila
                        permohonan disemak.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifPrefs.smsApp}
                      onChange={(e) =>
                        setNotifPrefs({
                          ...notifPrefs,
                          smsApp: e.target.checked,
                        })
                      }
                      style={{
                        width: 18,
                        height: 18,
                        accentColor: "var(--gold)",
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={() =>
                      showToast("Keutamaan pemberitahuan disimpan!")
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "12px 24px",
                      background: "var(--gold)",
                      color: "#000",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <Save size={15} /> Simpan Keutamaan
                  </button>
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

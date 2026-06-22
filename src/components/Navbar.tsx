"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  BookOpen,
  Rss,
  FolderLock,
  Info,
  Menu,
  X,
  Bell,
  User,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const publicLinks = [
  { href: "/", label: "Utama", icon: Home },
  { href: "/programs", label: "Program", icon: BookOpen },
  { href: "/feed", label: "Berita", icon: Rss },
  { href: "/info", label: "Info", icon: Info },
];

const privateLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/programs", label: "Program", icon: BookOpen },
  { href: "/info", label: "Info", icon: Info },
  { href: "/vault", label: "Vault", icon: FolderLock },
];

const adminLinks = [
  { href: "/admin/dashboard", label: "Admin", icon: ShieldCheck },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const isAdmin = !!(profile?.is_admin === true || profile?.meta?.is_admin === true);
  const navLinks = user
    ? isAdmin
      ? [...privateLinks, ...adminLinks]
      : privateLinks
    : publicLinks;

  const getDisplayName = () => {
    if (profile?.full_name) return String(profile.full_name);
    if (user?.email) return String(user.email);
    return null;
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    // Check initial session from server-side cookie (works when auth happened on server)
    const checkUser = async () => {
      try {
        const res = await fetch("/api/auth/user", { cache: "no-store" });
        if (!res.ok) {
          setUser(null);
          setLoading(false);
          return;
        }
        const payload = await res.json();
        console.debug("auth:user payload", payload);
        setUser(payload.user ?? null);
        setProfile(payload.profile ?? null);
      } catch (err) {
        console.debug("auth:user fetch error", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.debug("auth:event", event, "session", session);
      const sessionUser = (session as any)?.user ?? null;
      setUser(sessionUser);

      // If we receive a session user from the realtime event, try to fetch profile client-side
      if (sessionUser?.id) {
        try {
          const pRes = await fetch(`/api/auth/user`, { cache: "no-store" });
          if (pRes.ok) {
            const pPayload = await pRes.json();
            setProfile(pPayload.profile ?? null);
          } else {
            setProfile(null);
          }
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      if (event === "SIGNED_OUT") {
        router.refresh();
      }
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      try {
        subscription.unsubscribe();
      } catch (e) {
        // ignore
      }
    };
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          transition: "all 0.3s ease",
          background: scrolled ? "rgba(10,22,40,0.95)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
          boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.3)" : "none",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 68,
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{ display: "flex", alignItems: "center", gap: 12 }}
          >
            <div
              style={{
                width: 45,
                height: 45,
                borderRadius: "50%",
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 6,
                flexShrink: 0,
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              }}
            >
              <img
                src="/yp-logo.png"
                alt="e-YP Logo"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                onError={(e) => {
                  const wrapper = e.currentTarget.parentElement;
                  if (wrapper) {
                    wrapper.style.display = "none";
                    if (wrapper.nextElementSibling) {
                      (
                        wrapper.nextElementSibling as HTMLElement
                      ).style.display = "flex";
                    }
                  }
                }}
              />
            </div>
            <div
              style={{
                display: "none",
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "linear-gradient(135deg, #F5A623, #D4891A)",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 800,
                fontSize: "1rem",
                color: "#0A1628",
                boxShadow: "0 4px 16px rgba(245,166,35,0.4)",
              }}
            >
              eYP
            </div>
            <div>
              <div
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 800,
                  fontSize: "1.05rem",
                  letterSpacing: "-0.01em",
                }}
              >
                e-YP
              </div>
              <div
                style={{
                  fontSize: "0.65rem",
                  color: "var(--text-muted)",
                  letterSpacing: "0.04em",
                  marginTop: -2,
                }}
              >
                YAYASAN PERAK
              </div>
            </div>
          </Link>

          {/* Desktop Links */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
            className="desktop-nav"
          >
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontSize: "0.84rem",
                  fontWeight: 500,
                  transition: "all 0.2s",
                  color:
                    pathname === href ? "var(--gold)" : "var(--text-secondary)",
                  background:
                    pathname === href ? "rgba(245,166,35,0.1)" : "transparent",
                }}
              >
                <Icon size={14} />
                {label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Notification */}
            {user && (
              <button
                style={{
                  position: "relative",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  padding: "9px",
                  display: "flex",
                  color: "var(--text-secondary)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--text-primary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--text-secondary)")
                }
              >
                <Bell size={17} />
                <span className="notif-badge">3</span>
              </button>
            )}

            {/* Profile / Login */}
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Link
                  href="/profile"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "rgba(245,166,35,0.1)",
                    border: "1px solid rgba(245,166,35,0.25)",
                    borderRadius: 10,
                    padding: "7px 14px",
                    fontSize: "0.84rem",
                    fontWeight: 600,
                    color: "var(--gold)",
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "linear-gradient(135deg, #F5A623, #D4891A)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#0A1628",
                      fontWeight: 700,
                      fontSize: "0.72rem",
                    }}
                  >
                    {getInitials(getDisplayName())}
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    padding: "9px",
                    display: "flex",
                    color: "var(--text-secondary)",
                    transition: "all 0.2s",
                  }}
                >
                  <LogOut size={17} />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "var(--gold)",
                  borderRadius: 10,
                  padding: "8px 18px",
                  fontSize: "0.84rem",
                  fontWeight: 700,
                  color: "#0A1628",
                  transition: "all 0.2s",
                  boxShadow: "0 4px 14px rgba(245,166,35,0.3)",
                }}
              >
                Log Masuk
              </Link>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                padding: "9px",
                display: "flex",
                color: "var(--text-primary)",
              }}
              className="mobile-menu-btn"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99,
            background: "rgba(10,22,40,0.98)",
            backdropFilter: "blur(20px)",
            paddingTop: 80,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            className="container"
            style={{ display: "flex", flexDirection: "column", gap: 4 }}
          >
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 18px",
                  borderRadius: 12,
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  transition: "all 0.2s",
                  color:
                    pathname === href ? "var(--gold)" : "var(--text-secondary)",
                  background:
                    pathname === href ? "rgba(245,166,35,0.1)" : "transparent",
                  border:
                    pathname === href
                      ? "1px solid rgba(245,166,35,0.2)"
                      : "1px solid transparent",
                }}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
            {/* Mobile drawer has only primary navigation links for better UX. */}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) { .desktop-nav { display: none !important; } .mobile-menu-btn { display: flex !important; } }
        @media (max-width: 600px) { .desktop-only { display: none; } }
      `}</style>
    </>
  );
}

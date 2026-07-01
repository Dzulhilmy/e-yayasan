"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  GraduationCap,
  Home,
  Briefcase,
  Users,
  CheckCircle,
  Star,
  TrendingUp,
  BookOpen,
  Zap,
  FolderLock,
  Bot,
  Bell,
  ShieldCheck,
  MapPin,
  ChevronRight,
  Sparkles,
  Rocket,
  Newspaper,
  Target,
  Info,
  Quote,
  ChevronLeft,
  Heart,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const stats = [
  { value: "150,000+", label: "Penerima Manfaat", icon: Users },
  { value: "RM 2.4B", label: "Bantuan Diagihkan", icon: TrendingUp },
  { value: "12", label: "Program Aktif", icon: CheckCircle },
  { value: "98%", label: "Kepuasan Penerima", icon: Star },
];

const mainPictureUrl = "";

const categoryStyles: Record<string, { color: string; bg: string }> = {
  Pendidikan: { color: "#F5A623", bg: "rgba(245,166,35,0.12)" },
  Sosial: { color: "#10B981", bg: "rgba(16,185,129,0.12)" },
  Usahawan: { color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
  "Modal Insan": { color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
  default: { color: "#0EA5E9", bg: "rgba(14,165,233,0.12)" },
};

// Same palette/fallback approach as the Info page fix, so colours stay
// consistent across pages even for categories that don't have a fixed
// mapping above.
const infoColorPalette = ["#EC4899", "#F5A623", "#0EA5E9", "#10B981", "#8B5CF6", "#F97316"];

function getProgramIcon(category?: string) {
  if (category === "Pendidikan") return GraduationCap;
  if (category === "Sosial") return Home;
  if (category?.toLowerCase().includes("usaha")) return Briefcase;
  return BookOpen;
}

const exclusiveFeatures = [
  { icon: TrendingUp, color: "#F5A623", title: "MyStatus Dashboard", desc: "Pantau semua permohonan dalam satu papan pemuka bersepadu.", href: "/dashboard" },
  { icon: FolderLock, color: "#0EA5E9", title: "Simpanan Dokumen", desc: "Simpan dokumen penting sekali, guna berulang kali.", href: "/vault" },
  { icon: Bell, color: "#10B981", title: "Sistem Notifikasi", desc: "Terima kemas kini status permohonan serta-merta.", href: "/dashboard" },
  { icon: ShieldCheck, color: "#8B5CF6", title: "Log Masuk Biometrik", desc: "Keselamatan tinggi dengan FaceID & PIN 6-digit.", href: "/dashboard" },
  { icon: MapPin, color: "#F97316", title: "Perak Prihatin", desc: "Notifikasi apabila berhampiran Reruai Pameran Yayasan Perak.", href: "/contact" },
  { icon: Bot, color: "#EC4899", title: "AI Assistant", desc: "Jawapan segera 24/7 dari Pembantu AI terlatih.", href: "/assistant" },
];

// REMOVED: hardcoded `latestNews` and `infoItems` arrays used to live
// here as module-level constants — exactly the same bug `programs` had
// before it was fixed below. Both are now fetched live inside the
// component via useEffect, same pattern as the programs fetch.

// REMOVED: hardcoded `homeQuotes` array (text/author/color shape) used
// to live here. The real `quotes` table only has id, image_url,
// created_at — no text/author column at all, same mismatch found on the
// dedicated /quotes page. This section now fetches real image rows
// below and renders an image carousel instead of a text-quote carousel.

// ─── Info Carousel Component (homepage version) ───────────────────────────
// Now takes its items as a prop instead of reading the removed
// module-level `infoItems` constant.
function HomeInfoCarousel({ items }: { items: any[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (items.length === 0) return;
    const t = setInterval(() => setCurrent((p) => (p + 1) % items.length), 3500);
    return () => clearInterval(t);
  }, [items.length]);

  if (items.length === 0) {
    return (
      <div style={{
        borderRadius: "var(--radius-lg)", border: "1px solid var(--border)",
        background: "var(--navy-card)", minHeight: 200,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--text-muted)",
      }}>
        Tiada info ditemui.
      </div>
    );
  }

  const item = items[current];
  return (
    <div style={{ position: "relative", borderRadius: "var(--radius-lg)", overflow: "hidden", border: `1px solid ${item.color}30`, background: "var(--navy-card)", minHeight: 200 }}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${item.color}15 0%, var(--navy-mid) 100%)` }} />
      {item.image_url && (
        <img src={item.image_url} alt={item.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      )}
      <div style={{
        position: "relative", zIndex: 1, padding: "28px",
        background: item.image_url ? "linear-gradient(to top, rgba(15,30,56,0.95) 0%, rgba(15,30,56,0.4) 50%, transparent 100%)" : "transparent",
        height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end",
      }}>
        <span style={{
          display: "inline-block", padding: "3px 10px", borderRadius: 100,
          background: `${item.color}22`, border: `1px solid ${item.color}40`,
          color: item.image_url ? "#fff" : item.color, fontSize: "0.7rem", fontWeight: 700,
          letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 14,
          alignSelf: "flex-start", backdropFilter: "blur(4px)",
        }}>
          {item.category}
        </span>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, lineHeight: 1.4, marginBottom: 8, color: "#fff" }}>{item.title}</h3>
        <p style={{ fontSize: "0.78rem", color: item.image_url ? "rgba(255,255,255,0.8)" : "var(--text-muted)" }}>{item.date}</p>
      </div>

      <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, zIndex: 2 }}>
        {items.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} style={{ width: i === current ? 18 : 6, height: 6, borderRadius: 100, background: i === current ? item.color : "rgba(255,255,255,0.25)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s ease" }} />
        ))}
      </div>
      <button onClick={() => setCurrent((p) => (p - 1 + items.length) % items.length)} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 30, height: 30, borderRadius: "50%", background: "rgba(15,30,56,0.8)", border: "1px solid var(--border)", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
        <ChevronLeft size={15} />
      </button>
      <button onClick={() => setCurrent((p) => (p + 1) % items.length)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 30, height: 30, borderRadius: "50%", background: "rgba(15,30,56,0.8)", border: "1px solid var(--border)", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
        <ChevronRight size={15} />
      </button>
    </div>
  );
}

export default function HomePage() {
  const [animated, setAnimated] = useState(false);
  const [quoteImages, setQuoteImages] = useState<{ id: string; image_url: string }[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(true);
  const [activeQuote, setActiveQuote] = useState(0);
  const [likedQuotes, setLikedQuotes] = useState<Set<string>>(new Set());

  const [programs, setPrograms] = useState<any[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);

  const [latestNews, setLatestNews] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  const [infoItems, setInfoItems] = useState<any[]>([]);
  const [loadingInfo, setLoadingInfo] = useState(true);

  useEffect(() => { setTimeout(() => setAnimated(true), 100); }, []);
  // ── YP Quotes (NEW — replaces the hardcoded `homeQuotes` array) ─────────
  // Fetches real rows from `quotes` (id, image_url, created_at only — no
  // text/author column exists in the schema). If the table is empty, we
  // simply leave quoteImages as [] and the section below renders nothing,
  // no mock fallback — matches what was done on the dedicated /quotes page.
  useEffect(() => {
    const fetchQuotes = async () => {
      setLoadingQuotes(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("quotes")
          .select("id, image_url")
          .order("created_at", { ascending: false })
          .limit(8);

        if (error) {
          console.error("Home quotes fetch error:", error);
          setQuoteImages([]);
          return;
        }
        setQuoteImages(data ?? []);
      } catch (err) {
        console.error("Home quotes fetch error:", err);
        setQuoteImages([]);
      } finally {
        setLoadingQuotes(false);
      }
    };
    fetchQuotes();
  }, []);

  useEffect(() => {
    if (quoteImages.length === 0) return;
    const t = setInterval(() => setActiveQuote((p) => (p + 1) % quoteImages.length), 5000);
    return () => clearInterval(t);
  }, [quoteImages.length]);

  // ── Programs (already working — unchanged) ──────────────────────────────
  useEffect(() => {
    const fetchPrograms = async () => {
      setLoadingPrograms(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("programs")
          .select("*")
          .eq("is_active", true)
          .order("title");

        if (!error && data) {
          setPrograms(
            data.map((item: any) => {
              const style = categoryStyles[item.category] || categoryStyles.default;
              return {
                icon: getProgramIcon(item.category),
                color: style.color,
                bg: style.bg,
                category: item.category || "Lain-lain",
                title: item.title,
                desc: item.description || item.subtitle || "",
                tag: item.category || "Aktif",
                href: "/login",
                imageUrl: item.image_url || "",
              };
            }),
          );
        }
      } catch (err) {
        console.error("Home programs fetch error:", err);
      } finally {
        setLoadingPrograms(false);
      }
    };
    fetchPrograms();
  }, []);

  // ── Latest News (NEW — replaces the hardcoded `latestNews` array) ───────
  // Pulls the 3 most recent feed_posts, same table the /feed page reads
  // from, so this section now genuinely mirrors what's in the database.
  useEffect(() => {
    const fetchNews = async () => {
      setLoadingNews(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("feed_posts")
          .select("*")
          .order("date_published", { ascending: false })
          .limit(3);

        if (error) {
          console.error("Home news fetch error:", error);
          setLatestNews([]);
          return;
        }

        const months = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"];
        setLatestNews(
          (data ?? []).map((item: any) => {
            const d = new Date(item.date_published);
            const dateStr = `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
            return {
              date: dateStr,
              title: item.title,
              category: item.category,
              imageUrl: item.image_url || "",
            };
          }),
        );
      } catch (err) {
        console.error("Home news fetch error:", err);
        setLatestNews([]);
      } finally {
        setLoadingNews(false);
      }
    };
    fetchNews();
  }, []);

  // ── Info Terkini (NEW — replaces the hardcoded `infoItems` array) ───────
  // Pulls from the same `infos` table the /info page reads from. The
  // `date` column there is free-form text (e.g. "20 Jun 2026"), so it's
  // displayed verbatim — no re-parsing with `new Date()`, which is what
  // caused "Invalid Date" on the admin info table previously.
  useEffect(() => {
    const fetchInfo = async () => {
      setLoadingInfo(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("infos")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) {
          console.error("Home info fetch error:", error);
          setInfoItems([]);
          return;
        }

        setInfoItems(
          (data ?? []).map((item: any, i: number) => ({
            id: item.id,
            title: item.title,
            category: item.category,
            date: item.date || "",
            color: item.color || infoColorPalette[i % infoColorPalette.length],
            image_url: item.image_url || "",
          })),
        );
      } catch (err) {
        console.error("Home info fetch error:", err);
        setInfoItems([]);
      } finally {
        setLoadingInfo(false);
      }
    };
    fetchInfo();
  }, []);

  const toggleLike = (id: string) =>
    setLikedQuotes((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });

  return (
    <>
      {/* ─── HERO ─── */}
      <section style={{ minHeight: "92vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", padding: "80px 0" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: 'url("/hero-bg.png")', backgroundSize: "cover", backgroundPosition: "center", opacity: 0.18, pointerEvents: "none", mixBlendMode: "luminosity" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,22,40,0.3) 0%, var(--navy) 100%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "30%", right: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
            <div style={{ opacity: animated ? 1 : 0, transform: animated ? "translateY(0)" : "translateY(20px)", transition: "all 0.6s ease" }}>
              <div className="section-label" style={{ margin: "0 auto 28px" }}>✦ Portal Digital Rasmi Yayasan Perak</div>
            </div>
            <div style={{ opacity: animated ? 1 : 0, transform: animated ? "translateY(0)" : "translateY(30px)", transition: "all 0.7s ease 0.1s" }}>
              <h1 className="heading-xl" style={{ marginBottom: 24 }}>
                <span className="gradient-text">Iltizam Pendidikan,</span><br />Transformasi Insan
              </h1>
            </div>
            <div style={{ opacity: animated ? 1 : 0, transform: animated ? "translateY(0)" : "translateY(30px)", transition: "all 0.7s ease 0.2s" }}>
              <p style={{ fontSize: "clamp(1rem,2vw,1.2rem)", color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: 40, maxWidth: 640, margin: "0 auto 40px" }}>
                Platform digital bersepadu e-YP — mohon bantuan, semak status permohonan, simpan dokumen dan terima notifikasi dalam satu aplikasi.
              </p>
            </div>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", opacity: animated ? 1 : 0, transform: animated ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s ease 0.3s" }}>
              <Link href="/login" className="btn btn-primary btn-lg"><Zap size={18} />Mohon Bantuan Sekarang</Link>
              <Link href="/login" className="btn btn-secondary btn-lg">Semak Status Saya<ArrowRight size={18} /></Link>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, marginTop: 48, flexWrap: "wrap", opacity: animated ? 1 : 0, transition: "all 0.7s ease 0.4s" }}>
              {["Selamat & Terenkripsi", "Data Disimpan Tempatan"].map((b) => (
                <div key={b} style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--text-muted)", fontSize: "0.82rem" }}>
                  <CheckCircle size={14} style={{ color: "var(--green)" }} />{b}
                </div>
              ))}
            </div>
            {mainPictureUrl && (
              <div style={{ marginTop: 60, opacity: animated ? 1 : 0, transform: animated ? "translateY(0)" : "translateY(40px)", transition: "all 0.8s ease 0.5s" }}>
                <div style={{ width: "100%", maxWidth: 900, margin: "0 auto", aspectRatio: "21/9", borderRadius: 24, overflow: "hidden", border: "1px solid var(--border)", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
                  <img src={mainPictureUrl} alt="Yayasan Perak" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section style={{ padding: "60px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--navy-mid)" }}>
        <div className="container">
          <div className="grid-4">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} style={{ textAlign: "center", padding: "24px 16px" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(245,166,35,0.12)", border: "1px solid rgba(245,166,35,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={22} style={{ color: "var(--gold)" }} />
                  </div>
                </div>
                <div style={{ fontFamily: "Plus Jakarta Sans,sans-serif", fontWeight: 800, fontSize: "2rem", color: "var(--gold)", letterSpacing: "-0.02em" }}>{value}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.86rem", marginTop: 6 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROGRAMS ─── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="section-label" style={{ margin: "0 auto 16px" }}><BookOpen size={16} /> Katalog Program</div>
            <h2 className="heading-lg">Program Bantuan <span className="gradient-text">Yayasan Perak</span></h2>
            <p style={{ color: "var(--text-secondary)", marginTop: 12, maxWidth: 540, margin: "12px auto 0" }}>Semak kelayakan dan mohon bantuan dalam beberapa langkah mudah.</p>
          </div>
          <div className="grid-4">
            {loadingPrograms ? (
              <div style={{ gridColumn: "1 / -1", color: "var(--text-muted)", padding: 24, textAlign: "center" }}>Memuatkan program...</div>
            ) : programs.length === 0 ? (
              <div style={{ gridColumn: "1 / -1", color: "var(--text-muted)", padding: 24, textAlign: "center" }}>Tiada program aktif ditemui.</div>
            ) : (
              programs.map((p) => (
                <div key={p.title} className="card" style={{ display: "flex", flexDirection: "column", gap: 16, padding: p.imageUrl ? "0 0 24px 0" : "24px", overflow: "hidden" }}>
                  {p.imageUrl && (
                    <div style={{ width: "100%", height: 160, position: "relative" }}>
                      <img src={p.imageUrl} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <span className="badge badge-green" style={{ position: "absolute", top: 16, right: 16, backdropFilter: "blur(8px)", background: "rgba(16, 185, 129, 0.8)" }}>{p.tag}</span>
                    </div>
                  )}
                  <div style={{ padding: p.imageUrl ? "0 24px" : 0, display: "flex", flexDirection: "column", flex: 1, gap: 16 }}>
                    {!p.imageUrl && (
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: p.bg, border: `1px solid ${p.color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <p.icon size={22} style={{ color: p.color }} />
                        </div>
                        <span className="badge badge-green">{p.tag}</span>
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: "0.72rem", fontWeight: 600, color: p.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{p.category}</div>
                      <h3 style={{ fontSize: "0.96rem", fontWeight: 700, lineHeight: 1.4, marginBottom: 8 }}>{p.title}</h3>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.84rem", lineHeight: 1.6 }}>{p.desc}</p>
                    </div>
                    <Link href={p.href} style={{ marginTop: "auto", display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.86rem", fontWeight: 600, color: p.color }}>
                      Semak Kelayakan <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Link href="/programs" className="btn btn-secondary">Lihat Semua Program <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* ─── APP-EXCLUSIVE FEATURES ─── */}
      <section className="section" style={{ background: "var(--navy-mid)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="section-label" style={{ margin: "0 auto 16px" }}><Rocket size={16} /> Ciri Eksklusif</div>
            <h2 className="heading-lg">Lebih Dari Sekadar <span className="gradient-text">Laman Web</span></h2>
            <p style={{ color: "var(--text-secondary)", marginTop: 12, maxWidth: 540, margin: "12px auto 0" }}>Ciri-ciri digital yang direka khusus untuk memudahkan urusan anda.</p>
          </div>
          <div className="grid-3">
            {exclusiveFeatures.map((f) => (
              <Link key={f.title} href={f.href} className="card" style={{ display: "flex", gap: 18, alignItems: "flex-start", textDecoration: "none" }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${f.color}18`, border: `1px solid ${f.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <f.icon size={22} style={{ color: f.color }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "0.98rem", fontWeight: 700, marginBottom: 6 }}>{f.title}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.84rem", lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LATEST NEWS ─── */}
      <section className="section">
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
            <div>
              <div className="section-label" style={{ marginBottom: 12 }}><Newspaper size={16} /> Berita Terkini</div>
              <h2 className="heading-md">Kemas Kini <span className="gradient-text">Terbaru</span></h2>
            </div>
            <Link href="/feed" className="btn btn-ghost btn-sm">Lihat Semua <ArrowRight size={14} /></Link>
          </div>

          {loadingNews ? (
            <div style={{ color: "var(--text-muted)", padding: 24, textAlign: "center" }}>Memuatkan berita...</div>
          ) : latestNews.length === 0 ? (
            <div style={{ color: "var(--text-muted)", padding: 24, textAlign: "center" }}>Tiada berita ditemui.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {latestNews.map((n, i) => (
                <Link key={i} href="/feed" className="card" style={{ display: "flex", alignItems: "center", gap: 20, textDecoration: "none", padding: n.imageUrl ? "12px 24px 12px 12px" : "24px" }}>
                  {n.imageUrl && (
                    <div style={{ width: 100, height: 80, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
                      <img src={n.imageUrl} alt={n.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                  {!n.imageUrl && (
                    <div style={{ width: 64, textAlign: "center", flexShrink: 0 }}>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500 }}>{n.date.split(" ")[1]} {n.date.split(" ")[2]}</div>
                      <div style={{ fontFamily: "Plus Jakarta Sans,sans-serif", fontWeight: 800, fontSize: "1.6rem", color: "var(--gold)", lineHeight: 1 }}>{n.date.split(" ")[0]}</div>
                    </div>
                  )}
                  {!n.imageUrl && <div style={{ width: 1, height: 48, background: "var(--border)" }} />}
                  <div style={{ flex: 1, paddingLeft: n.imageUrl ? 8 : 0 }}>
                    <span className="badge badge-blue" style={{ marginBottom: 8 }}>{n.category}</span>
                    <h3 style={{ fontWeight: 600, fontSize: "0.96rem", lineHeight: 1.5 }}>{n.title}</h3>
                  </div>
                  <ChevronRight size={18} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── INFO TERKINI ─── */}
      <section className="section" style={{ background: "var(--navy-mid)" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
            <div>
              <div className="section-label" style={{ marginBottom: 12 }}><Info size={16} /> Info Terkini</div>
              <h2 className="heading-md">Maklumat &amp; <span className="gradient-text">Pengumuman</span></h2>
            </div>
            <Link href="/info" className="btn btn-ghost btn-sm">Lihat Semua <ArrowRight size={14} /></Link>
          </div>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            {loadingInfo ? (
              <div style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", background: "var(--navy-card)", minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                Memuatkan...
              </div>
            ) : (
              <HomeInfoCarousel items={infoItems} />
            )}
          </div>
        </div>
      </section>

      {/* ─── YP QUOTES ─── */}
      {/* Section is skipped entirely if there are no rows in `quotes` —
          no mock fallback, per the same approach used on /quotes page. */}
      {!loadingQuotes && quoteImages.length > 0 && (
        <section className="section">
          <div className="container">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
              <div>
                <div className="section-label" style={{ marginBottom: 12 }}><Sparkles size={16} /> YP Quotes</div>
                <h2 className="heading-md">Kata-kata <span className="gradient-text">Ilham</span></h2>
              </div>
              <Link href="/quotes" className="btn btn-ghost btn-sm">Lihat Semua <ArrowRight size={14} /></Link>
            </div>

            <div style={{
              maxWidth: 480, margin: "0 auto", position: "relative",
              borderRadius: "var(--radius-lg)", overflow: "hidden",
              border: "1px solid var(--border)", background: "var(--navy-card)",
              aspectRatio: "4/3",
            }}>
              <img
                key={quoteImages[activeQuote].id}
                src={quoteImages[activeQuote].image_url}
                alt="YP Quote"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />

              {quoteImages.length > 1 && (
                <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8 }}>
                  {quoteImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveQuote(i)}
                      style={{
                        width: i === activeQuote ? 20 : 7, height: 7, borderRadius: 100,
                        background: i === activeQuote ? "var(--gold)" : "rgba(255,255,255,0.4)",
                        border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s ease",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA BANNER ─── */}
      <section className="section-sm">
        <div className="container">
          <div style={{ background: "linear-gradient(135deg, var(--navy-light) 0%, var(--navy-card) 100%)", border: "1px solid var(--border-gold)", borderRadius: "var(--radius-lg)", padding: "clamp(32px,6vw,64px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div className="section-label" style={{ margin: "0 auto 20px" }}><Target size={16} /> Mulakan Sekarang</div>
            <h2 className="heading-lg" style={{ marginBottom: 16 }}>Sedia Untuk <span className="gradient-text">Mohon Bantuan?</span></h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem", marginBottom: 32, maxWidth: 500, margin: "0 auto 32px" }}>Proses permohonan mudah, selamat dan boleh dipantau dari mana sahaja.</p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/login" className="btn btn-primary btn-lg"><Zap size={18} />Mohon Bantuan</Link>
              <Link href="/assistant" className="btn btn-ghost btn-lg"><Bot size={18} />Tanya AI Assistant</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
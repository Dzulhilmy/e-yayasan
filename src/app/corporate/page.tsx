"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Info, ArrowLeft } from "lucide-react";

export default function CorporatePage() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("corporate_sections")
        .select("*")
        .order("display_order", { ascending: true });
      if (!error && data) {
        setSections(data);
      } else {
        console.error("Corporate sections fetch error:", error);
      }
      setLoading(false);
    };
    fetchSections();
  }, []);

  return (
    <div>
      <section
        style={{
          padding: "80px 0 40px",
          background:
            "linear-gradient(180deg, var(--navy) 0%, var(--navy-mid) 100%)",
          borderBottom: "1px solid var(--border)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="container">
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              textDecoration: "none",
              marginBottom: 24,
            }}
          >
            <ArrowLeft size={15} /> Kembali ke Utama
          </Link>
          <div>
            <div className="section-label" style={{ marginBottom: 16 }}>
              <Info size={16} /> Info Korporat
            </div>
            <h1 className="heading-lg" style={{ marginBottom: 12 }}>
              Semua Seksyen Korporat dalam satu halaman
            </h1>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "1rem",
                maxWidth: 560,
                lineHeight: 1.7,
              }}
            >
              Terokai semua maklumat korporat Yayasan Perak seperti peranan,
              visi & misi, sejarah kepimpinan dan pengurusan dalam satu halaman
              komprehensif.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(220px, 280px) 1fr",
              gap: 32,
              alignItems: "start",
            }}
          >
            <aside style={{ position: "sticky", top: 120 }}>
              <div
                style={{
                  padding: 24,
                  borderRadius: 20,
                  background: "var(--navy-card)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    marginBottom: 16,
                  }}
                >
                  Navigasi Seksyen
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.slug}`}
                      style={{
                        color: "var(--text-secondary)",
                        textDecoration: "none",
                        padding: "10px 14px",
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.03)",
                        transition: "background 0.2s",
                      }}
                    >
                      {section.title}
                    </a>
                  ))}
                </div>
              </div>
            </aside>

            <main>
              {loading ? (
                <div
                  style={{
                    padding: 24,
                    background: "var(--navy-card)",
                    borderRadius: 20,
                    border: "1px solid var(--border)",
                    color: "var(--text-muted)",
                  }}
                >
                  Memuatkan seksyen korporat...
                </div>
              ) : sections.length === 0 ? (
                <div
                  style={{
                    padding: 24,
                    background: "var(--navy-card)",
                    borderRadius: 20,
                    border: "1px solid var(--border)",
                    color: "var(--text-muted)",
                  }}
                >
                  Tiada seksyen korporat ditemui.
                </div>
              ) : (
                sections.map((section) => (
                  <section
                    key={section.id}
                    id={section.slug}
                    style={{
                      marginBottom: 36,
                      padding: 24,
                      borderRadius: 20,
                      background: "var(--navy-card)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 14,
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 36,
                          height: 36,
                          borderRadius: 12,
                          background: "rgba(245,166,35,0.15)",
                          color: "var(--gold)",
                        }}
                      >
                        <Info size={18} />
                      </span>
                      <div>
                        <h2
                          style={{
                            margin: 0,
                            fontSize: "1.25rem",
                            fontWeight: 700,
                          }}
                        >
                          {section.title}
                        </h2>
                        {section.subtitle ? (
                          <p
                            style={{
                              margin: 4,
                              color: "var(--text-secondary)",
                              fontSize: "0.95rem",
                            }}
                          >
                            {section.subtitle}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    {section.image_url ? (
                      <img
                        src={section.image_url}
                        alt={section.title}
                        style={{
                          width: "100%",
                          maxHeight: 340,
                          objectFit: "cover",
                          borderRadius: 16,
                          marginBottom: 20,
                        }}
                      />
                    ) : null}
                    {String(section.content || "")
                      .split("\n")
                      .map((line, index) => (
                        <p
                          key={index}
                          style={{
                            marginBottom: 16,
                            color: "var(--text-secondary)",
                            lineHeight: 1.8,
                          }}
                        >
                          {line}
                        </p>
                      ))}
                  </section>
                ))
              )}
            </main>
          </div>
        </div>
      </section>
    </div>
  );
}

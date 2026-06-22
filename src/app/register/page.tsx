"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: "",
    name: "",
    nric: "",
    phone: "",
    address_line: "",
    postcode: "",
    city: "",
    state: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (user) {
        setForm((f) => ({
          ...f,
          email: user.email ?? "",
          name:
            (user.user_metadata as any)?.name ??
            (user.user_metadata as any)?.full_name ??
            "",
        }));
      }

      try {
        const res = await fetch("/api/profile/get");
        if (res.ok) {
          const payload = await res.json();
          if (payload.profile) {
            setForm((f) => ({
              ...f,
              email: payload.profile.email ?? user?.email ?? "",
              name:
                payload.profile.full_name ??
                (user ? ((user.user_metadata as any)?.name ?? "") : ""),
              nric: payload.profile.nric ?? "",
              phone: payload.profile.phone ?? "",
              address_line: payload.profile.address_line ?? "",
              postcode: payload.profile.postcode ?? "",
              city: payload.profile.city ?? "",
              state: payload.profile.state ?? "",
            }));
          }
        }
      } catch (err) {
        // ignore
      }

      setLoading(false);
    })();
  }, []);

  const validateField = (k: string, v: string) => {
    const copy: Record<string, string> = {};
    if (k === "nric") {
      const ok =
        /^(?:\d{6}-?\d{2}-?\d{4}|\d{12})$/.test(v.trim()) || v.trim() === "";
      if (!ok) copy.nric = "Format NRIC tidak sah";
    }
    if (k === "postcode") {
      const ok = /^\d{5}$/.test(v.trim()) || v.trim() === "";
      if (!ok) copy.postcode = "Poskod mesti 5 digit";
    }
    if (k === "phone") {
      const ok = /^[+\d][\d\s-]{7,14}$/.test(v.trim()) || v.trim() === "";
      if (!ok) copy.phone = "Nombor telefon tidak sah";
    }
    if (k === "name") {
      if (v.trim() === "") copy.name = "Nama diperlukan";
    }
    return copy;
  };

  const update = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((prev) => {
      const next = { ...prev };
      const fieldErrors = validateField(k, v);
      // remove previous error for this key
      delete next[k];
      return { ...next, ...fieldErrors };
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // client-side validation snapshot
    if (Object.keys(errors).length > 0) {
      alert("Sila betulkan ralat borang terlebih dahulu");
      setSaving(false);
      return;
    }

    const payload = {
      full_name: form.name,
      nric: form.nric,
      phone: form.phone,
      address_line: form.address_line,
      postcode: form.postcode,
      city: form.city,
      state: form.state,
    };

    try {
      const res = await fetch("/api/profile/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        alert("Save failed: " + txt);
      } else {
        alert("Profile saved");
      }
    } catch (err) {
      alert("Save error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container section-sm">Loading…</div>;

  return (
    <div className="container section-sm">
      <h1 className="heading-lg">Lengkapkan Maklumat Akaun</h1>
      <p style={{ color: "var(--text-muted)" }}>
        Kami telah mengisi sebahagian maklumat daripada log masuk anda. Sila
        lengkapkan maklumat yang diperlukan.
      </p>

      <form
        onSubmit={onSubmit}
        style={{
          marginTop: 18,
          maxWidth: 740,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <label>
            Nama Penuh (seperti IC)
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="input"
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </label>

          <label>
            No. Kad Pengenalan
            <input
              value={form.nric}
              onChange={(e) => update("nric", e.target.value)}
              className="input"
            />
            {errors.nric && <div className="form-error">{errors.nric}</div>}
          </label>

          <label>
            No. Telefon
            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="input"
              placeholder="011-XXXXXXXX"
            />
            {errors.phone && <div className="form-error">{errors.phone}</div>}
          </label>

          <label>
            Emel
            <input value={form.email} readOnly className="input" />
          </label>

          <label style={{ gridColumn: "1 / -1" }}>
            Alamat (Baris)
            <input
              value={form.address_line}
              onChange={(e) => update("address_line", e.target.value)}
              className="input"
              placeholder="No. Rumah, Jalan, Taman, Poskod, Daerah, Perak"
            />
          </label>

          <label>
            Poskod
            <input
              value={form.postcode}
              onChange={(e) => update("postcode", e.target.value)}
              className="input"
            />
            {errors.postcode && (
              <div className="form-error">{errors.postcode}</div>
            )}
          </label>

          <label>
            Bandar
            <input
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              className="input"
            />
          </label>

          <label>
            Negeri
            <select
              value={form.state}
              onChange={(e) => update("state", e.target.value)}
              className="input"
            >
              <option value="">Pilih Negeri</option>
              <option>Perak</option>
              <option>Selangor</option>
              <option>Wilayah Persekutuan</option>
              <option>Johor</option>
              <option>Kedah</option>
              <option>Kelantan</option>
              <option>Melaka</option>
              <option>N.Sembilan</option>
              <option>Pahang</option>
              <option>Pulau Pinang</option>
              <option>Sabah</option>
              <option>Sarawak</option>
              <option>Terengganu</option>
            </select>
          </label>
        </div>

        <div style={{ marginTop: 8 }}>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Menyimpan…" : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}

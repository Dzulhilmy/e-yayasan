'use client';
import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, MessageCircle, BookOpen, HelpCircle, Zap, RefreshCw } from 'lucide-react';

type Message = { role: 'bot' | 'user'; text: string; time: string };

const faqs = [
  { q: 'Apa itu INSISYP?', a: 'INSISYP (Insentif Siswa Yayasan Perak) ialah program insentif kewangan kepada pelajar cemerlang Perak yang melanjutkan pengajian ke IPT dalam dan luar negara. Amaun insentif adalah antara RM1,500 hingga RM5,000 bergantung kepada peringkat pengajian dan institusi.' },
  { q: 'Bagaimana cara mohon bantuan?', a: 'Anda boleh membuat permohonan melalui portal e-YP ini. Klik "Mohon Bantuan" di menu utama, pilih program yang sesuai, isikan borang digital dan muat naik dokumen diperlukan. Proses mengambil masa 7-14 hari bekerja.' },
  { q: 'Apakah syarat kelayakan TASPENDIK?', a: 'TASPENDIK terbuka kepada anak-anak Perak berumur 0-12 tahun. Ibu bapa mestilah warganegara Malaysia yang bermastautin di Perak. Pendaftaran boleh dibuat sepanjang tahun tanpa had tarikh akhir.' },
  { q: 'Berapa lama proses kelulusan?', a: 'Tempoh pemprosesan permohonan berbeza mengikut jenis program: Bantuan Kecemasan (3-7 hari bekerja), INSISYP (14-21 hari bekerja), Pinjaman Usahawan (21-30 hari bekerja). Anda akan menerima notifikasi melalui emel dan SMS.' },
  { q: 'Bolehkah saya semak status permohonan?', a: 'Ya! Pergi ke bahagian "MyStatus Dashboard" dalam e-YP. Anda boleh melihat status terkini, dokumen yang dikemukakan dan nota daripada pegawai Yayasan Perak secara real-time.' },
  { q: 'Apa dokumen yang diperlukan?', a: 'Dokumen asas yang diperlukan: (1) Salinan IC / MyKad, (2) Sijil akademik terkini, (3) Slip gaji / pendapatan ibu bapa, (4) Surat tawaran IPT (jika berkaitan). Anda boleh menyimpan dokumen ini dalam Digital Vault untuk digunakan semula.' },
];

const suggestedQuestions = [
  'Apa itu INSISYP?',
  'Syarat TASPENDIK?',
  'Status permohonan saya?',
  'Dokumen yang diperlukan?',
];

function getTime() {
  return new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' });
}

function getBotReply(input: string): string {
  const low = input.toLowerCase();
  const match = faqs.find(f =>
    f.q.toLowerCase().includes(low) ||
    low.includes(f.q.toLowerCase().split(' ').slice(1, 3).join(' ').toLowerCase()) ||
    f.a.toLowerCase().includes(low.split(' ').slice(0, 2).join(' '))
  );
  if (match) return match.a;
  if (low.includes('insisyp') || low.includes('insentif siswa')) return faqs[0].a;
  if (low.includes('mohon') || low.includes('apply') || low.includes('permohonan')) return faqs[1].a;
  if (low.includes('taspendik') || low.includes('tabung simpan')) return faqs[2].a;
  if (low.includes('lama') || low.includes('berapa hari') || low.includes('kelulusan')) return faqs[3].a;
  if (low.includes('status') || low.includes('semak')) return faqs[4].a;
  if (low.includes('dokumen') || low.includes('ic') || low.includes('sijil')) return faqs[5].a;
  if (low.includes('hubungi') || low.includes('telefon') || low.includes('office')) return 'Pejabat Yayasan Perak boleh dihubungi di: 📞 05-255 2929 | 📧 info@yayasanperak.com.my | 🏢 Wisma Yayasan Perak, No. 111, Jalan Sultan Idris Shah, 30000 Ipoh, Perak. Waktu pejabat: Isnin–Jumaat, 8:00 pagi – 5:00 petang.';
  return 'Terima kasih atas soalan anda! Saya tidak dapat menjawab soalan ini secara spesifik. Sila hubungi pejabat Yayasan Perak di 05-255 2929 atau emailkan kepada info@yayasanperak.com.my untuk bantuan lanjut. Anda juga boleh melawat laman web rasmi di yayasanperak.gov.my.';
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Assalamualaikum! 👋 Saya Pembantu AI e-YP, sedia membantu anda 24/7. Apa yang boleh saya bantu hari ini? Anda boleh bertanya tentang program bantuan, cara mohon, syarat kelayakan dan banyak lagi.', time: getTime() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    const userMsg: Message = { role: 'user', text: msg, time: getTime() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setTimeout(() => {
      const reply = getBotReply(msg);
      setMessages(prev => [...prev, { role: 'bot', text: reply, time: getTime() }]);
      setLoading(false);
    }, 900);
  };

  const reset = () => {
    setMessages([{ role: 'bot', text: 'Perbualan baharu dimulakan. Bagaimana saya boleh membantu anda?', time: getTime() }]);
  };

  return (
    <>
      <div className="page-hero" style={{ padding: '100px 0 40px' }}>
        <div className="page-hero-bg" />
        <div className="container">
          <div className="section-label">🤖 AI Assistant</div>
          <h1 className="heading-lg" style={{ marginTop: 12 }}>Pembantu AI <span className="gradient-text">e-YP</span></h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Jawapan segera 24/7 — terlatih dengan maklumat lengkap Yayasan Perak.</p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 60 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 28 }}>
          {/* Chat Window */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '65vh' }}>
            {/* Chat Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #F5A623, #D4891A)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <Bot size={20} style={{ color: 'var(--navy)' }} />
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: '50%', background: 'var(--green)', border: '2px solid var(--navy-card)' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.96rem' }}>Pembantu AI e-YP</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
                    Dalam Talian
                  </div>
                </div>
              </div>
              <button onClick={reset} className="btn btn-ghost btn-sm"><RefreshCw size={14} />Reset</button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {msg.role === 'bot' && (
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #F5A623, #D4891A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, alignSelf: 'flex-end' }}>
                      <Bot size={16} style={{ color: 'var(--navy)' }} />
                    </div>
                  )}
                  <div style={{
                    maxWidth: '78%', padding: '12px 16px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: msg.role === 'user' ? 'linear-gradient(135deg, var(--gold), var(--gold-dark))' : 'var(--navy-light)',
                    color: msg.role === 'user' ? 'var(--navy)' : 'var(--text-primary)',
                    border: msg.role === 'bot' ? '1px solid var(--border)' : 'none',
                  }}>
                    <p style={{ fontSize: '0.88rem', lineHeight: 1.65 }}>{msg.text}</p>
                    <div style={{ fontSize: '0.68rem', opacity: 0.6, marginTop: 6, textAlign: 'right' }}>{msg.time}</div>
                  </div>
                  {msg.role === 'user' && (
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--navy-light)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, alignSelf: 'flex-end' }}>
                      <User size={16} style={{ color: 'var(--text-secondary)' }} />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #F5A623, #D4891A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot size={16} style={{ color: 'var(--navy)' }} />
                  </div>
                  <div style={{ padding: '14px 18px', background: 'var(--navy-light)', borderRadius: '18px 18px 18px 4px', border: '1px solid var(--border)', display: 'flex', gap: 6, alignItems: 'center' }}>
                    {[0, 1, 2].map(d => (
                      <div key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gold)', animation: `pulse 1.4s ease-in-out ${d * 0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 12 }}>
              <input
                className="input-field"
                placeholder="Taip soalan anda..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                style={{ flex: 1 }}
              />
              <button onClick={() => send()} className="btn btn-primary" disabled={!input.trim() || loading} style={{ padding: '12px 18px' }}>
                <Send size={16} />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Quick Questions */}
            <div className="card">
              <h3 style={{ fontWeight: 700, fontSize: '0.96rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} style={{ color: 'var(--gold)' }} /> Soalan Popular
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {suggestedQuestions.map(q => (
                  <button key={q} onClick={() => send(q)} style={{ textAlign: 'left', padding: '10px 14px', borderRadius: 10, background: 'var(--navy-mid)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.84rem', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,166,35,0.3)'; e.currentTarget.style.color = 'var(--gold)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* FAQ Topics */}
            <div className="card">
              <h3 style={{ fontWeight: 700, fontSize: '0.96rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <HelpCircle size={16} style={{ color: 'var(--teal)' }} /> Topik FAQ
              </h3>
              {[
                { icon: BookOpen, label: 'Program Pendidikan', color: 'var(--gold)' },
                { icon: Zap, label: 'Cara Permohonan', color: 'var(--green)' },
                { icon: MessageCircle, label: 'Status & Kelulusan', color: 'var(--teal)' },
                { icon: HelpCircle, label: 'Kelayakan', color: 'var(--purple)' },
              ].map(t => (
                <button key={t.label} onClick={() => send(t.label)} style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '0.86rem', cursor: 'pointer', marginBottom: 4, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--navy-mid)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                  <t.icon size={15} style={{ color: t.color }} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { transform: scale(0.7); opacity: 0.5; } 50% { transform: scale(1); opacity: 1; } }
        @media (max-width: 900px) {
          .container > div:last-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}

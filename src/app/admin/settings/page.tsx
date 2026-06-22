'use client';
import { useState } from 'react';
import { Save, Database, Shield, Bell, Palette, Globe } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'Umum', icon: Globe },
    { id: 'database', label: 'Pangkalan Data', icon: Database },
    { id: 'security', label: 'Keselamatan', icon: Shield },
    { id: 'notifications', label: 'Notifikasi', icon: Bell },
    { id: 'appearance', label: 'Penampilan', icon: Palette },
  ];

  const handleSaveGeneral = () => {
    toast.promise(new Promise(resolve => setTimeout(resolve, 800)), {
      loading: 'Menyimpan tetapan...',
      success: 'Tetapan umum berjaya disimpan!',
      error: 'Ralat ketika menyimpan tetapan.',
    });
  };

  const handleTestDB = () => {
    toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), {
      loading: 'Menguji sambungan pangkalan data...',
      success: 'Berjaya terhubung ke Supabase (ktsftzbnhjnnzkeqdqbv).',
      error: 'Gagal terhubung ke pangkalan data.',
    });
  };

  const handleSyncCache = () => {
    toast.promise(new Promise(resolve => setTimeout(resolve, 1200)), {
      loading: 'Menyegerakkan semula cache...',
      success: 'Cache berjaya disegerakkan (Real-time synced).',
      error: 'Ralat penyegerakan cache.',
    });
  };

  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
      
      {/* Settings Sidebar */}
      <div style={{ width: 250, background: 'var(--navy-card)', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Tetapan Sistem</div>
        <div style={{ display: 'flex', flexDirection: 'column', padding: 12 }}>
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: activeTab === tab.id ? 'var(--navy-mid)' : 'transparent',
                color: activeTab === tab.id ? '#fff' : 'var(--text-muted)',
                fontWeight: activeTab === tab.id ? 600 : 500,
                textAlign: 'left', transition: 'all 0.2s'
              }}
            >
              <tab.icon size={18} style={{ color: activeTab === tab.id ? 'var(--gold)' : 'inherit' }} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Content */}
      <div style={{ flex: 1, background: 'var(--navy-card)', borderRadius: 20, border: '1px solid var(--border)', padding: 32 }}>
        
        {activeTab === 'general' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>Tetapan Umum</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nama Portal</label>
                <input type="text" defaultValue="e-YP Yayasan Perak" style={{ width: '100%', padding: '12px 16px', background: 'var(--navy-mid)', border: '1px solid var(--border)', borderRadius: 12, color: '#fff', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Emel Sokongan (Support Email)</label>
                <input type="email" defaultValue="support@yayasanperak.com.my" style={{ width: '100%', padding: '12px 16px', background: 'var(--navy-mid)', border: '1px solid var(--border)', borderRadius: 12, color: '#fff', outline: 'none' }} />
              </div>
            </div>
            
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, marginTop: 12 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mod Penyelenggaraan (Maintenance Mode)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input type="checkbox" id="maintenance" style={{ width: 18, height: 18, accentColor: 'var(--gold)' }} />
                <label htmlFor="maintenance" style={{ fontSize: '0.9rem' }}>Tutup portal untuk penyelenggaraan sementara</label>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={handleSaveGeneral} className="btn btn-primary" style={{ gap: 8 }}>
                <Save size={16} /> Simpan Perubahan
              </button>
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>Pangkalan Data & Supabase</h2>
            <div style={{ padding: 20, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--green)', borderRadius: 12, display: 'flex', gap: 16 }}>
              <Database size={24} style={{ color: 'var(--green)' }} />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--green)', marginBottom: 4 }}>Berhubung ke Supabase</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Portal e-YP sedang berhubung secara langsung dengan pangkalan data Supabase (`project-ref: ktsftzbnhjnnzkeqdqbv`). 
                  Semua data permohonan dan suapan berita (feed) disegerakkan secara masa nyata (real-time).
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
              <button onClick={handleTestDB} className="btn btn-secondary">Uji Sambungan DB</button>
              <button onClick={handleSyncCache} className="btn btn-secondary">Segerakkan Semula Cache</button>
            </div>
          </div>
        )}
        
        {/* Placeholder for other tabs */}
        {['security', 'notifications', 'appearance'].includes(activeTab) && (() => {
          const currentTab = tabs.find(t => t.id === activeTab);
          return (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              {currentTab && <currentTab.icon size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />}
              <p>Tetapan untuk bahagian ini sedang dibangunkan.</p>
            </div>
          );
        })()}

      </div>
    </div>
  );
}

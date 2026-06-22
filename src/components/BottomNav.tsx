'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, BookOpen, Rss, FolderLock, Info } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

const publicItems = [
  { href: '/', label: 'Utama', icon: Home },
  { href: '/programs', label: 'Program', icon: BookOpen },
  { href: '/feed', label: 'Berita', icon: Rss },
  { href: '/info', label: 'Info', icon: Info },
];

const privateItems = [
  //{ href: '/', label: 'Utama', icon: Home },
  { href: '/dashboard', label: 'Status', icon: LayoutDashboard },
  { href: '/programs', label: 'Program', icon: BookOpen },
  { href: '/info', label: 'Info', icon: Info },
  { href: '/vault', label: 'Vault', icon: FolderLock },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  if (pathname === '/login' || pathname === '/signup') return null;

  const navItems = user ? privateItems : publicItems;
  
  const activeIndex = navItems.findIndex(item => {
    if (item.href === '/') return pathname === '/';
    return pathname.startsWith(item.href);
  });

  return (
    <div className="bottom-nav-root">
      <div className="bottom-nav-glass-pill">
        <div className="nav-items-wrapper">
          {navItems.map((item, idx) => {
            const isActive = idx === activeIndex;
            const Icon = item.icon;
            
            return (
              <Link 
                key={`${item.label}-${idx}`} 
                href={item.href} 
                className="nav-link-item"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <div className="icon-box-outer">
                  {/* Persistent Active Glow that slides between items */}
                  {isActive && (
                    <motion.div 
                      layoutId="active-nav-glow"
                      className="active-glow-bg"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  
                  <motion.div 
                    className="icon-inner"
                    animate={{ 
                      color: isActive ? '#F5A623' : 'rgba(255,255,255,0.35)',
                      scale: isActive ? 1.3 : 1,
                      filter: isActive ? 'drop-shadow(0 0 8px rgba(245, 166, 35, 0.4))' : 'none'
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  </motion.div>

                  {isActive && (
                    <motion.div 
                      layoutId="nav-active-dot"
                      className="nav-dot"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .bottom-nav-root {
          position: fixed;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          display: none;
        }

        @media (max-width: 900px) {
          .bottom-nav-root { display: block; }
        }

        .bottom-nav-glass-pill {
          background: rgba(15, 30, 56, 0.85);
          backdrop-filter: blur(25px) saturate(180%);
          -webkit-backdrop-filter: blur(25px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 100px;
          padding: 8px 24px;
          box-shadow: 
            0 20px 50px rgba(0, 0, 0, 0.6),
            inset 0 1px 1px rgba(255, 255, 255, 0.1);
          min-width: 340px;
          max-width: 95vw;
        }

        .nav-items-wrapper {
          display: flex;
          justify-content: space-around;
          align-items: center;
          height: 56px;
          gap: 12px;
        }

        .nav-link-item {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          text-decoration: none;
          position: relative;
          outline: none;
        }

        .icon-box-outer {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 54px;
          height: 54px;
        }

        .active-glow-bg {
          position: absolute;
          width: 48px;
          height: 48px;
          background: radial-gradient(circle, rgba(245, 166, 35, 0.28) 0%, transparent 72%);
          border-radius: 50%;
          z-index: 1;
          pointer-events: none;
        }

        .icon-inner {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-dot {
          position: absolute;
          bottom: -4px;
          width: 4px;
          height: 4px;
          background: var(--gold);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--gold);
          z-index: 3;
        }

        /* Top gloss highlight */
        .bottom-nav-glass-pill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 85%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

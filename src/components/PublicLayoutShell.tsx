'use client';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNav from './BottomNav';
import AIAssistant from './AIAssistant';

// Routes that should render with NO public shell (no navbar, footer, bottom nav, AI widget).
// Add any other standalone/auth pages here as you build them.
const SHELL_EXCLUDED_PREFIXES = [
  '/admin',
  '/login',
  '/signup',
  '/register',
  '/forgot-password',
  '/reset-password',
];

export default function PublicLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isShellExcluded = SHELL_EXCLUDED_PREFIXES.some((prefix) =>
    pathname?.startsWith(prefix)
  );

  if (isShellExcluded) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="main-content">{children}</main>
      <BottomNav />
      <AIAssistant />
      <Footer />

      <style>{`
        .main-content {
          padding-top: 68px;
          min-height: 100vh;
        }
        @media (max-width: 900px) {
          .main-content {
            padding-bottom: 100px;
          }
        }
      `}</style>
    </>
  );
}
'use client';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNav from './BottomNav';
import AIAssistant from './AIAssistant';

export default function PublicLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
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

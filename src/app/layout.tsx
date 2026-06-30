import type { Metadata } from 'next';
import './globals.css';
import PublicLayoutShell from '@/components/PublicLayoutShell';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'e-YP | Portal Digital Yayasan Perak',
  description: 'Portal rasmi digital Yayasan Perak. Semak status permohonan, mohon bantuan, dan akses maklumat program pendidikan, sosial dan keusahawanan.',
  keywords: 'Yayasan Perak, bantuan pendidikan, INSISYP, TASPENDIK, Sara Diri, e-YP',
  openGraph: {
    title: 'e-YP | Portal Digital Yayasan Perak',
    description: 'Platform digital bersepadu untuk rakyat Perak',
    siteName: 'e-YP Yayasan Perak',
  },
  icons: {
    icon: 'public/logo-yp.png',
    apple: 'public/logo-yp.png',
  },
    
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Toaster position="top-right" richColors theme="dark" />
        <PublicLayoutShell>{children}</PublicLayoutShell>
      </body>
    </html>
  );
}

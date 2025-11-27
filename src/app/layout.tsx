import type { Metadata } from 'next';
import '../styles/globals.css';
import { PrimeReactProvider } from 'primereact/api';
import FontStyle from '@/components/FontStyle';

export const metadata: Metadata = {
  title: 'P&SC Intelligence Centre',
  description: 'P&SC Intelligence Centre Dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <FontStyle />
        <PrimeReactProvider>
          <div className="flex min-h-screen">
            {/* <Sidebar /> */}
            <main className="flex-grow">{children}</main>
          </div>
        </PrimeReactProvider>
      </body>
    </html>
  );
}

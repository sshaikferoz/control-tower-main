import type { Metadata } from 'next';
import './globals.css';
import { PrimeReactProvider } from 'primereact/api';
import FontStyle from '@/components/FontStyle';
import { Providers } from '@/lib/providers';
import { ThemeScript } from '@/components/ui/ThemeScript';


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
        <html lang="en" data-theme="dark" className="dark">
            <head>
                <ThemeScript />
            </head>
            <body>
                <FontStyle />
                <Providers>
                    <PrimeReactProvider>
                        <div className="flex min-h-screen">
                            {/* <Sidebar /> */}
                            <main className="flex-grow">{children}</main>
                        </div>
                    </PrimeReactProvider>
                </Providers>
            </body>
        </html>
    );
}

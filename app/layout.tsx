import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import Navbar from '@/components/sections/Navbar';
import { Providers } from './providers';
import { auth } from '@/auth';

export const metadata: Metadata = {
  title: 'AuthJs Mongo Template',
  description: 'A template for Next.js 14.2+ with Auth.js and MongoDB'
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning className="light">
      <body>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="light">
            <Navbar session={session} />
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}

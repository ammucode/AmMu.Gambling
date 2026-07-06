import { Geist_Mono, Inter } from 'next/font/google';

import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers';
import SidebarRoot from '@/components/blocks/sidebar/root';
import { UIProviders } from '@/components/ui-providers';
import { SidebarInset } from '@ui/sidebar';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const maybeGradientBackground = "bg-radial-[at_50%_30%] from-[rgb(63,140,46)] to-[rgb(25,63,19)]";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        'antialiased',
        fontMono.variable,
        'font-sans',
        inter.variable
      )}
    >
      <body>
        <ThemeProvider>
          <Providers>
            <UIProviders>
              <SidebarRoot />
              <SidebarInset className="bg-green-800">{children}</SidebarInset>
            </UIProviders>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}

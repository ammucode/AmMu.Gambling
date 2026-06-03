import { Geist, Geist_Mono, Inter } from 'next/font/google';

import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers';
import Sidebar from '@/components/blocks/sidebar/sidebar';
import { UIProviders } from '@/components/ui-providers';
import { SidebarInset } from '@/components/ui/sidebar';
import { TanStackDevtools } from '@tanstack/react-devtools'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

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
              <Sidebar />
              <SidebarInset>{children}</SidebarInset>
              {/* <ReactQueryDevtools initialIsOpen={false} position='right' /> */}
              
            </UIProviders>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}

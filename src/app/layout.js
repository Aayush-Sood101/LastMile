import './globals.css';
import { Inter } from 'next/font/google';
import { ToastProvider } from '@/components/Toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'LastMile - Neighborhood Delivery Coordinator',
  description: 'Save money and reduce emissions with optimized last mile deliveries',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} antialiased bg-gradient-to-br from-gray-50 via-white to-emerald-50/30`} suppressHydrationWarning>
        <ToastProvider>
          <main className="min-h-screen">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}

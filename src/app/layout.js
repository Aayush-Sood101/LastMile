import './globals.css';
import { Inter } from 'next/font/google';
import { ToastProvider } from '@/components/Toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Neighborhood Bulk Order Coordinator',
  description: 'Save money and reduce emissions with grouped deliveries',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <ToastProvider>
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
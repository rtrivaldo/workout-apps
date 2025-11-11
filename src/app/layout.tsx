import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'FitTrack — Workout & Diet Planner',
  description: 'Track your workouts, log your daily meals, and monitor your fitness progress effortlessly with FitTrack — your personal health companion.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${poppins.className} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

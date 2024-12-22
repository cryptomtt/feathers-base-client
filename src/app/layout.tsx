import React from 'react';
import { Toaster } from 'react-hot-toast';
import { ClientProvider } from '@/contexts/ClientContext';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Feathers User Management',
  description: 'User management system with FeathersJS and Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <ClientProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ClientProvider>
      </body>
    </html>
  );
} 
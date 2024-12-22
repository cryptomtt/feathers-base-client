import React from 'react';
import { Providers } from '@/providers';
import { ClientLayout } from '@/components/ClientLayout';
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
      <body>
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
} 
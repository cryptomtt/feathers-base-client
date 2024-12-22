'use client';

import React from 'react';
import { PrivyProvider } from './PrivyProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { ClientProvider } from '@/contexts/ClientContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider>
      <ClientProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ClientProvider>
    </PrivyProvider>
  );
} 
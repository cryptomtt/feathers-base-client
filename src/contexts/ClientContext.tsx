'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import restClient from '@/lib/feathers';
import socketClient from '@/lib/feathers-socket';
import type { AppType } from '@/lib/feathers';

type ClientType = 'rest' | 'socket';

interface ClientContextType {
  client: AppType;
  clientType: ClientType;
  switchClient: (type: ClientType) => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export function ClientProvider({ children }: { children: ReactNode }) {
  const [clientType, setClientType] = useState<ClientType>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('clientType') as ClientType) || 'rest';
    }
    return 'rest';
  });

  const getClient = (type: ClientType) => {
    return (type === 'rest' ? restClient : socketClient) as AppType;
  };

  const switchClient = (type: ClientType) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('clientType', type);
    }
    setClientType(type);
  };

  return (
    <ClientContext.Provider 
      value={{ 
        client: getClient(clientType), 
        clientType, 
        switchClient 
      }}
    >
      {children}
    </ClientContext.Provider>
  );
}

export const useClient = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
}; 
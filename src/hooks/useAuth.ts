'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClient } from '@/contexts/ClientContext';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import type { User, LoginData } from '@/types/user';

interface AuthResponse {
  accessToken: string;
  user: User;
  authType?: 'privy' | 'local';
}

export function useAuth() {
  const { client } = useClient();
  const { 
    logout: privyLogout, 
    ready: privyReady, 
    authenticated: privyAuthenticated, 
    user: privyUser,
    getAccessToken
  } = usePrivy();
  const { wallets } = useWallets();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authType, setAuthType] = useState<'privy' | 'local' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('Auth State:', {
      privyAuthenticated,
      privyReady,
      privyUser: !!privyUser,
      token,
      authType,
      user: !!user
    });

    const handleAuth = async () => {
      if (!privyReady) {
        console.log('Privy not ready yet');
        return;
      }

      // Get stored tokens
      const storedToken = localStorage.getItem('feathers-jwt');
      const storedAuthType = localStorage.getItem('auth-type');
      
      // Handle Privy Authentication
      if (privyAuthenticated && privyUser) {
        try {
          // Get token directly from Privy
          const privyToken = await getAccessToken();
          
          console.log('Attempting Privy authentication with token');

          const response = await client.authenticate({
            strategy: 'privy',
            privyUser: {
              id: privyUser.id,
              createdAt: privyUser.createdAt,
              hasAcceptedTerms: privyUser.hasAcceptedTerms,
              isGuest: privyUser.isGuest,
              linkedAccounts: privyUser.linkedAccounts,
              verifiedEmails: privyUser.verifiedEmails,
              verifiedPhones: privyUser.verifiedPhones,
              verifiedWallets: privyUser.verifiedWallets
            },
            privyToken
          }) as AuthResponse;
          
          localStorage.setItem('feathers-jwt', response.accessToken);
          localStorage.setItem('auth-type', 'privy');
          setToken(response.accessToken);
          setUser(response.user);
          setAuthType('privy');
          setIsLoading(false);
          return;
        } catch (error) {
          console.error('Privy auth error:', error);
        }
      }
      // Handle JWT Authentication
      else if (storedToken && storedAuthType === 'local') {
        try {
          const response = await client.authenticate({
            strategy: 'jwt',
            accessToken: storedToken
          }) as AuthResponse;
          
          setToken(response.accessToken);
          setUser(response.user);
          setAuthType('local');
          setIsLoading(false);
          return;
        } catch (error) {
          console.error('JWT auth error:', error);
          localStorage.removeItem('feathers-jwt');
          localStorage.removeItem('auth-type');
        }
      }

      // If no authentication was successful
      setIsLoading(false);
      if (!privyAuthenticated && !storedToken) {
        router.push('/login');
      }
    };

    handleAuth();
  }, [client, router, privyAuthenticated, privyReady, privyUser, getAccessToken]);

  const login = async (data: LoginData) => {
    const response = await client.authenticate({
      ...data,
      strategy: 'local'
    }) as AuthResponse;
    
    localStorage.setItem('feathers-jwt', response.accessToken);
    localStorage.setItem('auth-type', 'local');
    setToken(response.accessToken);
    setUser(response.user);
    setAuthType('local');
  };

  const logout = async () => {
    try {
      if (authType === 'privy') {
        await privyLogout();
      }
      
      localStorage.removeItem('feathers-jwt');
      localStorage.removeItem('auth-type');
      setUser(null);
      setToken(null);
      setAuthType(null);

      try {
        await client.logout();
      } catch (error) {
        console.log('Feathers logout error (non-critical):', error);
      }

      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('feathers-jwt');
      localStorage.removeItem('auth-type');
      setUser(null);
      setToken(null);
      setAuthType(null);
      router.push('/login');
    }
  };

  return { user, login, logout, isLoading, token, authType };
} 
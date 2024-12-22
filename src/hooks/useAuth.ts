'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClient } from '@/contexts/ClientContext';
import type { User, LoginData } from '@/types/user';

interface AuthResponse {
  accessToken: string;
  user: User;
}

export function useAuth() {
  const { client } = useClient();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('feathers-jwt');
      if (!storedToken) {
        setIsLoading(false);
        router.push('/login');
        return;
      }
      
      try {
        const response = await client.authenticate({
          strategy: 'jwt',
          accessToken: storedToken
        }) as AuthResponse;
        
        setToken(response.accessToken);
        setUser(response.user);
      } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('feathers-jwt');
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, [client, router]);

  useEffect(() => {
    if (!isLoading && !user && window.location.pathname !== '/login') {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  const login = async (data: LoginData) => {
    const response = await client.authenticate({
      ...data,
      strategy: 'local'
    }) as AuthResponse;
    
    localStorage.setItem('feathers-jwt', response.accessToken);
    setToken(response.accessToken);
    setUser(response.user);
  };

  const logout = async () => {
    try {
      await client.logout();
      localStorage.removeItem('feathers-jwt');
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('feathers-jwt');
      setUser(null);
      router.push('/login');
    }
  };

  return { user, login, logout, isLoading, token };
} 
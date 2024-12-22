'use client';

import { feathers } from '@feathersjs/feathers'
import rest from '@feathersjs/rest-client'
import authentication from '@feathersjs/authentication-client'
import type { Application } from '@feathersjs/feathers'
import type { AuthenticationService } from '@feathersjs/authentication'
import type { AuthenticationResult } from '@feathersjs/authentication-client'
import axios from 'axios'

interface AuthenticationResult {
  accessToken: string;
  user: any;
}

interface ServiceTypes {
  users: any;
  authentication: AuthenticationService;
}

export type AppType = Application<ServiceTypes> & {
  authenticate: (data?: any) => Promise<AuthenticationResult>;
  logout: () => Promise<void>;
}

const app = feathers() as AppType
const restClient = rest('http://localhost:3030')

// Configure an axios instance with interceptors for auth token
const axiosInstance = axios.create();
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('feathers-jwt');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Configure REST client with axios
app.configure(restClient.axios(axiosInstance))
// Configure authentication
app.configure(authentication({
  storage: typeof window !== 'undefined' ? window.localStorage : null,
  storageKey: 'feathers-jwt',
  path: '/authentication' // your authentication service path
}))

export default app 
'use client';

import { feathers } from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import { Socket, Manager, ManagerOptions, SocketOptions } from 'socket.io-client';
import { io as socketIO } from 'socket.io-client';
import authentication from '@feathersjs/authentication-client';
import type { HookContext, Application } from '@feathersjs/feathers';
import type { AuthenticationService } from '@feathersjs/authentication';
import type { AuthenticationResult } from '@feathersjs/authentication-client';
import type { AppType } from './feathers';

// Enable Socket.IO debugging
if (typeof window !== 'undefined') {
  localStorage.setItem('debug', 'socket.io-client:*');
}

type ExtendedSocket = Socket & {
  io?: {
    engine?: {
      protocol?: number;
      transport?: { name: string };
      attempts?: number;
    }
  }
};

// Create Socket.io instance with proper configuration
const socket: ExtendedSocket = socketIO('http://localhost:3030', {
  transports: ['websocket'],
  forceNew: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
  autoConnect: true,
  extraHeaders: {
    Authorization: typeof window !== 'undefined' 
      ? `Bearer ${localStorage.getItem('feathers-jwt')}` 
      : ''
  }
});

const app = feathers() as AppType;

// Configure Socket.io client
app.configure(socketio(socket));

// Configure authentication
app.configure(authentication({
  storage: typeof window !== 'undefined' ? window.localStorage : null,
  storageKey: 'feathers-jwt',
  path: 'authentication',
  jwtStrategy: 'jwt',
  locationKey: 'access_token',
  locationErrorKey: 'error'
}));

// Enhanced debugging for socket events with more details
socket.onAny((eventName: string, ...args: unknown[]) => {
  console.group(`📥 Incoming Socket Event: ${eventName}`);
  console.log('Time:', new Date().toISOString());
  console.log('Event:', eventName);
  console.log('Payload:', args.map((arg, index) => {
    if (typeof arg === 'function') return 'Function';
    try {
      return JSON.stringify(arg, null, 2);
    } catch (e) {
      return `Arg ${index}: [Complex Object]`;
    }
  }));
  console.log('Socket ID:', socket.id);
  console.groupEnd();
});

const originalEmit = socket.emit;
socket.emit = function(eventName: string, ...args: any[]) {
  const payload = args;
  console.group(`📤 Outgoing Socket Event: ${eventName}`);
  console.log('Time:', new Date().toISOString());
  console.log('Event:', eventName);
  console.log('Payload:', payload.map((item, index) => {
    if (typeof item === 'function') return 'Function';
    try {
      return JSON.stringify(item, null, 2);
    } catch (e) {
      return `Arg ${index}: [Complex Object]`;
    }
  }));
  console.log('Socket ID:', socket.id);
  console.groupEnd();
  return originalEmit.apply(this, [eventName, ...args]);
};

// Service method logging
['find', 'get', 'create', 'patch', 'update', 'remove'].forEach(method => {
  app.service('users').hooks({
    before: {
      [method]: [(context: HookContext) => {
        console.group(`🔄 Service ${method.toUpperCase()} Request`);
        console.log('Time:', new Date().toISOString());
        console.log('Service:', context.path);
        console.log('Data:', context.data);
        console.log('Params:', context.params);
        console.groupEnd();
        return context;
      }]
    },
    after: {
      [method]: [(context: HookContext) => {
        console.group(`✅ Service ${method.toUpperCase()} Result`);
        console.log('Time:', new Date().toISOString());
        console.log('Service:', context.path);
        console.log('Result:', context.result);
        console.groupEnd();
        return context;
      }]
    }
  });
});

// Enhanced connection status listeners
socket.on('connect', () => {
  console.group('🟢 Socket Connected');
  console.log('Time:', new Date().toISOString());
  console.log('Socket ID:', socket.id);
  console.log('Transport:', socket.io?.engine?.transport?.name);
  console.log('Protocol:', socket.io?.engine?.protocol);
  console.groupEnd();
});

socket.on('connect_error', (error: Error) => {
  console.group('🔴 Socket Connection Error');
  console.log('Time:', new Date().toISOString());
  console.log('Error:', {
    message: error.message,
    transport: socket.io?.engine?.transport?.name
  });
  console.log('Attempt:', socket.io?.engine?.attempts);
  console.groupEnd();
});

socket.on('disconnect', (reason: string) => {
  console.group('🟡 Socket Disconnected');
  console.log('Time:', new Date().toISOString());
  console.log('Details:', {
    reason,
    wasClean: reason === 'io client disconnect' || reason === 'io server disconnect',
    transport: socket.io?.engine?.transport?.name
  });
  console.groupEnd();
});

socket.on('reconnect_attempt', (attemptNumber: number) => {
  console.group('🔄 Socket Reconnecting');
  console.log('Time:', new Date().toISOString());
  console.log('Details:', {
    attempt: attemptNumber,
    transport: socket.io?.engine?.transport?.name
  });
  console.groupEnd();
});

socket.on('reconnect', (attemptNumber: number) => {
  console.group('🟢 Socket Reconnected');
  console.log('Time:', new Date().toISOString());
  console.log('Details:', {
    attempt: attemptNumber,
    transport: socket.io?.engine?.transport?.name,
    socketId: socket.id
  });
  console.groupEnd();
});

socket.on('error', (error: Error) => {
  console.group('⚠ Socket Error');
  console.log('Time:', new Date().toISOString());
  console.log('Error:', {
    message: error.message,
    transport: socket.io?.engine?.transport?.name
  });
  console.groupEnd();
});

export default app;
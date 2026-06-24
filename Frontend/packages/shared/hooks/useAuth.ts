import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { validName, validPassword } from '../validation';
import { soapClient } from '../soap-client';

export interface AuthUser extends User {
  usuario?: string;
  cedula?: string;
  cupoMaximo?: number;
  esApto?: boolean;
  creditoCedula?: string;
  creditoMonto?: number;
}

interface AuthStore {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  loginSOAP: (usuario: string, contrasena: string) => Promise<{ ok: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: () => boolean;
  setCupoMaximo: (monto: number) => void;
  setEsApto: (apto: boolean) => void;
  setCreditoCedula: (cedula: string) => void;
  setCreditoMonto: (monto: number) => void;
  clearCredito: () => void;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,

      login: async (email, password) => {
        // Deprecated: kept for backward compatibility
        if (!password) return { ok: false, error: 'Contraseña requerida' };
        if (!validPassword(password)) return { ok: false, error: 'Contraseña incorrecta' };
        await new Promise(r => setTimeout(r, 600));
        set({
          user: {
            id: `user-${Date.now()}`,
            name: email.split('@')[0],
            email,
          },
        });
        return { ok: true };
      },

      loginSOAP: async (usuario, contrasena) => {
        try {
          const result = await soapClient.login(usuario, contrasena);
          set({
            user: {
              id: `user-${Date.now()}`,
              name: usuario,
              email: `${usuario}@ticketpremium.local`,
              usuario: result.usuario,
              cedula: result.cedula,
            },
          });
          return { ok: true };
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Credenciales inválidas';
          return { ok: false, error: msg };
        }
      },

      register: async (name, email, password) => {
        if (!validName(name)) return { ok: false, error: 'Nombre inválido' };
        if (!validPassword(password)) return { ok: false, error: 'La contraseña debe tener al menos 6 caracteres' };
        await new Promise(r => setTimeout(r, 600));
        set({
          user: {
            id: `user-${Date.now()}`,
            name: name.trim(),
            email,
          },
        });
        return { ok: true };
      },

      logout: () => set({ user: null }),

      isAuthenticated: () => get().user !== null,

      setCupoMaximo: (monto: number) => {
        set((state) => ({
          user: state.user ? { ...state.user, cupoMaximo: monto } : null,
        }));
      },

      setEsApto: (apto: boolean) => {
        set((state) => ({
          user: state.user ? { ...state.user, esApto: apto } : null,
        }));
      },

      setCreditoCedula: (cedula: string) => {
        set((state) => ({
          user: state.user ? { ...state.user, creditoCedula: cedula } : null,
        }));
      },

      setCreditoMonto: (monto: number) => {
        set((state) => ({
          user: state.user ? { ...state.user, creditoMonto: monto } : null,
        }));
      },

      clearCredito: () => {
        set((state) => ({
          user: state.user
            ? { ...state.user, creditoCedula: undefined, creditoMonto: undefined, esApto: undefined, cupoMaximo: undefined }
            : null,
        }));
      },
    }),
    { name: 'ticketpremium-auth' }
  )
);

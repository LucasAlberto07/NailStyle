import { create } from "zustand";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  role?: string;
}

interface AuthStore {
  usuario: Usuario | null;
  isLoading: boolean;
  error: string | null;
  setUsuario: (usuario: Usuario | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  usuario: null,
  isLoading: false,
  error: null,
  setUsuario: (usuario) => set({ usuario, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  logout: () => set({ usuario: null, error: null }),
}));

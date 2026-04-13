import { useState, useEffect, useCallback } from "react";
import { getStoredUser, clearToken, getMe, setStoredUser } from "@/lib/api";

export type AuthUser = {
  id: string;
  email: string;
  full_name: string | null;
  has_pan: boolean;
  created_at: string;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!user;

  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);
      const data = (await getMe()) as AuthUser;
      setUser(data);
      setStoredUser(data);
    } catch {
      setUser(null);
      clearToken();
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user) {
      refreshUser();
    }
  }, []);

  return { user, isAuthenticated, loading, logout, refreshUser, setUser };
}

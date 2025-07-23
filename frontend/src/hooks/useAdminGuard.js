import { useEffect, useState } from 'react';

export default function useAdminGuard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setIsAdmin(data.role === "ROLE_ADMIN");
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } catch (e) {
        setUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  return { isAdmin, loading, user };
} 
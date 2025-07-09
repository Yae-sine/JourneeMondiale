import { useEffect, useState } from 'react';

export default function useAdminGuard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('http://localhost:8080/api/auth/me', { credentials: 'include' });
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
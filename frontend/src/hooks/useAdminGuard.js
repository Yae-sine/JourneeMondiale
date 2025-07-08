import { useEffect, useState } from 'react';

export default function useAdminGuard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          console.log(data)
          setIsAdmin(data.role === 'ROLE_ADMIN');
          console.log(isAdmin)
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
"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

export default function MaintenanceListener() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (session?.user?.role === 'OWNER') return;

    let pollInterval: NodeJS.Timeout;

    const checkMaintenance = async () => {
      try {
        const response = await fetch('/api/maintenance-check');
        if (response.ok) {
          const data = await response.json();
          
          if (data.isEnabled && pathname !== '/maintenance') {
            router.push('/maintenance');
            router.refresh();
          } else if (!data.isEnabled && pathname === '/maintenance') {
            router.push('/');
            router.refresh();
          }
        }
      } catch (error) {
        console.error('Error checking maintenance:', error);
      }
    };

    // ✅ Reduced polling: Check every 30 seconds instead of 3 seconds
    checkMaintenance();
    pollInterval = setInterval(checkMaintenance, 30000); // 30 seconds

    // ✅ Still use instant updates for same-user actions
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'maintenance-toggle') {
        checkMaintenance(); // Instant check on toggle
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [session, router, pathname]);

  return null;
}
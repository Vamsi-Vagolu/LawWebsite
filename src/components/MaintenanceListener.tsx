"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

export default function MaintenanceListener() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect owners
    if (session?.user?.role === 'OWNER') {
      return;
    }

    let pollInterval: NodeJS.Timeout;

    const checkMaintenance = async () => {
      try {
        // ✅ Use the same API endpoint as middleware
        const response = await fetch('/api/maintenance-check');
        if (response.ok) {
          const data = await response.json();
          
          console.log('🔍 Maintenance status:', data.isEnabled);
          console.log('🔍 Current pathname:', pathname);
          
          // Redirect TO maintenance when enabled
          if (data.isEnabled && pathname !== '/maintenance') {
            console.log('🚧 Redirecting TO maintenance');
            router.push('/maintenance');
            router.refresh();
          } 
          // Redirect FROM maintenance when disabled
          else if (!data.isEnabled && pathname === '/maintenance') {
            console.log('✅ Redirecting FROM maintenance');
            router.push('/');
            router.refresh();
          }
        }
      } catch (error) {
        console.error('Error checking maintenance:', error);
      }
    };

    // Check immediately and every 3 seconds
    checkMaintenance();
    pollInterval = setInterval(checkMaintenance, 3000);

    // Listen for storage/broadcast changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'maintenance-toggle') {
        console.log('📢 Storage change detected');
        checkMaintenance(); // Recheck immediately
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
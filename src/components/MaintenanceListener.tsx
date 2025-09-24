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

    let pollInterval: number | null = null;
    let endTimeTimeout: number | null = null;

    const checkMaintenanceState = async () => {
      try {
        const response = await fetch('/api/maintenance');
        if (!response.ok) return;
        
        const data = await response.json();
        
        // Only handle maintenance-to-normal transitions
        if (!data.isEnabled && pathname === '/maintenance') {
          console.log('✅ Maintenance ended, redirecting back...');
          router.push('/');
          router.refresh();
          return;
        }
        
        // If we're on maintenance page, setup end detection
        if (data.isEnabled && pathname === '/maintenance') {
          if (data.endTime) {
            startTimerBasedStrategy(data.endTime);
          } else {
            startPollingForEnd();
          }
        }
        
      } catch (error) {
        console.error('Error checking maintenance:', error);
      }
    };

    const startTimerBasedStrategy = (endTime: string) => {
      console.log('🎯 Timer strategy: Auto-redirect when maintenance ends');
      
      const endDate = new Date(endTime);
      const now = new Date();
      const timeUntilEnd = endDate.getTime() - now.getTime();
      
      if (timeUntilEnd > 0) {
        endTimeTimeout = window.setTimeout(() => {
          console.log('⏰ Maintenance timer expired, redirecting...');
          router.push('/');
          router.refresh();
        }, timeUntilEnd);
      } else {
        router.push('/');
        router.refresh();
      }
    };

    const startPollingForEnd = () => {
      console.log('🔄 Polling strategy: Watching for maintenance end');
      
      const checkForEnd = async () => {
        try {
          const response = await fetch('/api/maintenance');
          if (response.ok) {
            const data = await response.json();
            if (!data.isEnabled) {
              router.push('/');
              router.refresh();
            }
          }
        } catch (error) {
          console.error('Error checking for maintenance end:', error);
        }
      };

      pollInterval = window.setInterval(checkForEnd, 30000);
    };

    const cleanup = () => {
      if (pollInterval !== null) {
        window.clearInterval(pollInterval);
        pollInterval = null;
      }
      if (endTimeTimeout !== null) {
        window.clearTimeout(endTimeTimeout);
        endTimeTimeout = null;
      }
    };

    // Only check state if we're on maintenance page
    if (pathname === '/maintenance') {
      checkMaintenanceState();
    }

    // Listen for owner toggles (instant feedback)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'maintenance-toggle') {
        checkMaintenanceState();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      cleanup();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [session, router, pathname]);

  return null;
}
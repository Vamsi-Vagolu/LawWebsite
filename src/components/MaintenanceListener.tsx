"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function MaintenanceListener() {
  const { data: session } = useSession();

  useEffect(() => {
    // ✅ Skip maintenance redirects for OWNER role
    if (session?.user?.role === 'OWNER') {
      console.log('👑 Owner detected - skipping maintenance redirects');
      return;
    }

    // ✅ Listen for maintenance changes and refresh page
    const handleMaintenanceChange = () => {
      console.log('🔄 Maintenance status changed - refreshing page...');
      
      // Small delay to ensure server state is updated
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    };

    // ✅ Listen for localStorage changes (cross-tab)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'maintenance-toggle') {
        handleMaintenanceChange();
      }
    };

    // ✅ Listen for BroadcastChannel messages
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('maintenance-updates');
      channel.addEventListener('message', (event) => {
        if (event.data.type === 'maintenance-toggled') {
          handleMaintenanceChange();
        }
      });
    } catch (e) {
      console.log('BroadcastChannel not supported');
    }

    // ✅ Polling fallback - check maintenance status every 15 seconds
    const pollMaintenanceStatus = async () => {
      try {
        const response = await fetch('/api/maintenance-check', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const currentPath = window.location.pathname;
          
          // If maintenance is enabled and we're not on maintenance page
          if (data.isEnabled && currentPath !== '/maintenance') {
            window.location.href = '/maintenance';
          }
          // If maintenance is disabled and we're on maintenance page
          else if (!data.isEnabled && currentPath === '/maintenance') {
            window.location.href = '/';
          }
        }
      } catch (error) {
        console.error('Error polling maintenance status:', error);
      }
    };

    // Start polling
    const pollInterval = setInterval(pollMaintenanceStatus, 15000);

    // Add event listeners
    window.addEventListener('storage', handleStorageChange);

    // ✅ Listen for focus events (when user returns to tab)
    const handleFocus = () => {
      setTimeout(pollMaintenanceStatus, 500);
    };
    
    window.addEventListener('focus', handleFocus);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(pollInterval);
      
      if (channel) {
        channel.close();
      }
    };
  }, [session]); // ✅ Add session as dependency

  return null; // This component doesn't render anything
}
'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Instantly hides/shows sidebar via CSS without waiting for server
 * This makes navigation feel instant (0ms delay)
 */
export function InstantSidebarToggle() {
  const pathname = usePathname();

  useEffect(() => {
    // Check if current page should hide sidebar
    const isEmailPage = pathname === '/dashboard/emails' || pathname.startsWith('/dashboard/emails/') ||
                        pathname === '/platform/emails' || pathname.startsWith('/platform/emails/');
    const isCalendarPage = pathname === '/dashboard/calendar' || pathname.startsWith('/dashboard/calendar/') ||
                           pathname === '/platform/calendar' || pathname.startsWith('/platform/calendar/');
    const isContactsPage = pathname === '/dashboard/contacts' || pathname.startsWith('/dashboard/contacts/') ||
                           pathname === '/platform/contacts' || pathname.startsWith('/platform/contacts/');

    const shouldHideSidebar = isEmailPage || isCalendarPage || isContactsPage;

    // Apply CSS class to hide sidebar INSTANTLY
    const sidebarElements = document.querySelectorAll('.app-sidebar');
    sidebarElements.forEach((sidebar) => {
      if (shouldHideSidebar) {
        (sidebar as HTMLElement).style.display = 'none';
      } else {
        (sidebar as HTMLElement).style.display = '';
      }
    });

    // Also update main content area to take full width
    const mainContent = document.querySelector('.main-content-area');
    if (mainContent) {
      if (shouldHideSidebar) {
        (mainContent as HTMLElement).style.marginLeft = '0';
        (mainContent as HTMLElement).style.width = '100%';
      } else {
        (mainContent as HTMLElement).style.marginLeft = '';
        (mainContent as HTMLElement).style.width = '';
      }
    }
  }, [pathname]);

  return null;
}



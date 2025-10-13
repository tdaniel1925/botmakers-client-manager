/**
 * Hey-Inspired Theme Configuration
 * Bold, high-contrast, modern design inspired by Hey but with custom branding
 */

export const heyTheme = {
  // Colors - Hey-inspired but not exact replicas
  colors: {
    // Primary palette
    primary: {
      yellow: '#FFCC00',
      orange: '#FF9500',
      purple: '#A855F7',
      pink: '#EC4899',
    },
    
    // View-specific colors
    views: {
      screener: {
        from: '#EF4444',
        to: '#EC4899',
        solid: '#EF4444',
      },
      imbox: {
        from: '#FBBF24',
        to: '#F59E0B',
        solid: '#F59E0B',
      },
      feed: {
        from: '#3B82F6',
        to: '#06B6D4',
        solid: '#3B82F6',
      },
      paperTrail: {
        from: '#6B7280',
        to: '#4B5563',
        solid: '#6B7280',
      },
      replyLater: {
        from: '#A855F7',
        to: '#EC4899',
        solid: '#A855F7',
      },
      setAside: {
        from: '#14B8A6',
        to: '#06B6D4',
        solid: '#14B8A6',
      },
    },
    
    // Semantic colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // Neutrals - High contrast
    background: '#FFFFFF',
    foreground: '#0F172A',
    muted: '#F1F5F9',
    mutedForeground: '#64748B',
    border: '#E2E8F0',
  },
  
  // Typography - Bold and clear
  typography: {
    fontFamily: {
      sans: 'var(--font-sans)',
      heading: 'var(--font-sans)',
    },
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  // Spacing - Generous whitespace
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },
  
  // Border radius - Smooth corners
  borderRadius: {
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    full: '9999px',
  },
  
  // Shadows - Subtle depth
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  
  // Animations - Smooth and delightful
  animations: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  
  // Component-specific styles
  components: {
    button: {
      primary: {
        background: 'linear-gradient(to right, #A855F7, #EC4899)',
        hover: 'linear-gradient(to right, #9333EA, #DB2777)',
        text: '#FFFFFF',
      },
      secondary: {
        background: '#F1F5F9',
        hover: '#E2E8F0',
        text: '#0F172A',
      },
      ghost: {
        background: 'transparent',
        hover: '#F1F5F9',
        text: '#64748B',
      },
    },
    card: {
      background: '#FFFFFF',
      border: '#E2E8F0',
      shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      hoverShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    input: {
      background: '#FFFFFF',
      border: '#E2E8F0',
      focusBorder: '#A855F7',
      text: '#0F172A',
      placeholder: '#94A3B8',
    },
  },
};

/**
 * Generate gradient class from view type
 */
export function getViewGradient(view: string): string {
  const gradients: Record<string, string> = {
    screener: 'from-red-400 to-pink-400',
    imbox: 'from-yellow-400 to-orange-400',
    feed: 'from-blue-400 to-cyan-400',
    paper_trail: 'from-gray-400 to-gray-500',
    reply_later: 'from-purple-400 to-pink-400',
    set_aside: 'from-teal-400 to-cyan-400',
  };
  
  return gradients[view] || 'from-gray-400 to-gray-500';
}

/**
 * Generate solid color class from view type
 */
export function getViewColor(view: string): string {
  const colors: Record<string, string> = {
    screener: 'text-red-600',
    imbox: 'text-orange-600',
    feed: 'text-blue-600',
    paper_trail: 'text-gray-600',
    reply_later: 'text-purple-600',
    set_aside: 'text-teal-600',
  };
  
  return colors[view] || 'text-gray-600';
}

/**
 * Generate background color for view badges
 */
export function getViewBadgeColor(view: string): string {
  const colors: Record<string, string> = {
    screener: 'bg-red-100 text-red-700 border-red-200',
    imbox: 'bg-orange-100 text-orange-700 border-orange-200',
    feed: 'bg-blue-100 text-blue-700 border-blue-200',
    paper_trail: 'bg-gray-100 text-gray-700 border-gray-200',
    reply_later: 'bg-purple-100 text-purple-700 border-purple-200',
    set_aside: 'bg-teal-100 text-teal-700 border-teal-200',
  };
  
  return colors[view] || 'bg-gray-100 text-gray-700 border-gray-200';
}



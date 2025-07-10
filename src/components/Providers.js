'use client';

import React, { useEffect, useState } from 'react';

// This component wraps all context providers
export default function Providers({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration errors by rendering children only on the client
  // This fixes issues with localStorage and other browser APIs
  if (!mounted) {
    // Return a static version with no client-specific code
    return (
      <div suppressHydrationWarning>
        {children}
      </div>
    );
  }

  return (
    <div>
      {children}
    </div>
  );
}

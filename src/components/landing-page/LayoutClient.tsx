"use client";

import { useEffect, useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import dynamic from 'next/dynamic';
import { Toaster } from "sonner";

// Dynamically import NextTopLoader with SSR disabled
const NextTopLoader = dynamic(
  () => import('nextjs-toploader'),
  { ssr: false }
);

// Crisp customer chat support:
// This component is separated from ClientLayout because it needs to be wrapped with <SessionProvider> to use useSession() hook


  // Add User Unique ID to Crisp to easily identify users when reaching support (optional)
 

// All the client wrappers are here (they can't be in server components)
// 1. NextTopLoader: Show a progress bar at the top when navigating between pages
// 2. Toaster: Show Success/Error messages anywhere from the app with toast()
// 3. Tooltip: Show tooltips if any JSX elements has these 2 attributes: data-tooltip-id="tooltip" data-tooltip-content=""
// 4. CrispChat: Set Crisp customer chat support (see above)
const ClientLayout = ({ children }: { children: ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {mounted && (
        <NextTopLoader 
          color="#3b82f6" 
          showSpinner={false}
          shadow="0 0 10px #3b82f6,0 0 5px #3b82f6"
        />
      )}
      <Toaster position="top-center" />

      {/* Content inside app/page.js files  */}
      {children}

      {/* Show Success/Error messages anywhere from the app with toast() */}
      

      {/* Show tooltips if any JSX elements has these 2 attributes: data-tooltip-id="tooltip" data-tooltip-content="" */}
      

      {/* Set Crisp customer chat support */}
      
    </>
  );
};

export default ClientLayout;

// app/components/HydrationZustand.js
"use client";
import { useEffect, useState } from "react";

export function HydrationProvider({ children }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <>
      <style jsx global>{`
        /* Remove Grammarly extension attributes on body */
        body[data-new-gr-c-s-check-loaded],
        body[data-gr-ext-installed] {
          font-family: inherit !important;
        }
      `}</style>
      {isHydrated ? children : null}
    </>
  );
}
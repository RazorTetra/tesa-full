// app/components/HydrationZustand.js
"use client";
import { useEffect, useState } from "react";

export function HydrationProvider({ children }) {
  const [isHydrated, setIsHydrated] = useState(false);

  // Fungsi untuk membersihkan atribut Grammarly
  const removeGrammarlyAttributes = () => {
    const body = document.body;
    if (body) {
      body.removeAttribute('data-new-gr-c-s-check-loaded');
      body.removeAttribute('data-gr-ext-installed');
      
      // Hapus juga observer Grammarly jika ada
      const observer = window.__grammarly?.s;
      if (observer) {
        observer.disconnect();
      }
    }
  };

  useEffect(() => {
    // Set hydrated state
    setIsHydrated(true);
    
    // Bersihkan atribut saat komponen mount
    removeGrammarlyAttributes();
    
    // Tambahkan MutationObserver untuk mencegah Grammarly menambahkan atribut kembali
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          if (mutation.attributeName === 'data-new-gr-c-s-check-loaded' ||
              mutation.attributeName === 'data-gr-ext-installed') {
            removeGrammarlyAttributes();
          }
        }
      });
    });

    // Mulai observasi
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-new-gr-c-s-check-loaded', 'data-gr-ext-installed']
    });

    // Cleanup saat unmount
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        body[data-new-gr-c-s-check-loaded],
        body[data-gr-ext-installed] {
          font-family: inherit !important;
        }
        
        /* Tambahan untuk mencegah Grammarly mempengaruhi layout */
        grammarly-desktop-integration,
        div[data-grammarly-part="button"],
        grammarly-extension {
          display: none !important;
        }
      `}</style>
      {isHydrated ? children : null}
    </>
  );
}
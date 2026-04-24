import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface UseScrollToTopOptions {
  behavior?: 'auto' | 'smooth';
  delay?: number;
  enabled?: boolean;
}

export const useScrollToTop = (options: UseScrollToTopOptions = {}) => {
  const { behavior = 'auto', delay = 0, enabled = true } = options;

  const pathname = usePathname();
  const prevPathnameRef = useRef<string | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (!enabled) return;

    // En el montaje inicial, no hacer nada (evita scroll al top al recargar)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevPathnameRef.current = pathname;
      return;
    }

    // Solo hacer scroll al top si hay un cambio de ruta real (navegación)
    if (prevPathnameRef.current && prevPathnameRef.current !== pathname) {
      const scrollToTop = () => {
        // Usar requestAnimationFrame para asegurar que el DOM esté listo
        requestAnimationFrame(() => {
          // Verificar si el navegador soporta smooth scroll
          if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({
              top: 0,
              left: 0,
              behavior,
            });
          } else {
            // Fallback para navegadores que no soportan smooth scroll
            window.scrollTo(0, 0);
          }
        });
      };

      if (delay > 0) {
        setTimeout(scrollToTop, delay);
      } else {
        scrollToTop();
      }
    }

    // Actualizar la referencia para la próxima navegación
    prevPathnameRef.current = pathname;
  }, [pathname, behavior, delay, enabled]);
};

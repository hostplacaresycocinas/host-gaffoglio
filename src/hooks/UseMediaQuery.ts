import { useState, useEffect } from 'react';

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // Actualizar el estado inicial
    setMatches(media.matches);

    // Crear el listener para cambios
    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // Agregar el listener
    media.addEventListener('change', listener);

    // Limpiar el listener
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
};

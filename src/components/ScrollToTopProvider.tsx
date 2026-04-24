'use client';

import { useScrollToTop } from '../hooks/useScrollToTop';

export const ScrollToTopProvider = () => {
  useScrollToTop({
    behavior: 'auto',
    delay: 0,
    enabled: true,
  });

  return null;
};

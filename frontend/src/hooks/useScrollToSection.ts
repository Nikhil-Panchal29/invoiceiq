import { useCallback } from 'react';

const NAV_OFFSET = 88;

export const useScrollToSection = () => {
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);

    if (!element) {
      return false;
    }

    const top = element.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;

    window.scrollTo({
      top,
      behavior: 'smooth',
    });

    return true;
  }, []);

  return { scrollToSection };
};

import { useEffect, RefObject } from 'react';

interface UseFocusTrapOptions {
  isOpen: boolean;
  onDismiss?: () => void;
}

export function useFocusTrap(ref: RefObject<HTMLElement | null>, options: UseFocusTrapOptions) {
  const { isOpen, onDismiss } = options;

  useEffect(() => {
    if (!isOpen || !ref.current) return;

    const element = ref.current;
    const focusableElements = element.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (firstFocusable) {
      firstFocusable.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onDismiss) {
        onDismiss();
        return;
      }

      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onDismiss, ref]);
}

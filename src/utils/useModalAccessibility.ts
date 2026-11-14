import { useEffect, type RefObject } from 'react';
import { FOCUSABLE_SELECTOR, getNextTrapFocusIndex } from './accessibility';

type UseModalAccessibilityOptions = {
  isOpen: boolean;
  onClose: () => void;
  dialogRef: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
  canClose?: boolean;
};

export function useModalAccessibility({
  isOpen,
  onClose,
  dialogRef,
  initialFocusRef,
  canClose = true,
}: UseModalAccessibilityOptions) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
        return;
      }
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable && focusable.length > 0) {
        focusable[0].focus();
      } else {
        dialogRef.current?.focus();
      }
    }, 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (canClose) {
          event.preventDefault();
          onClose();
        }
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => element.offsetParent !== null || element === document.activeElement);

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const activeIndex = focusable.indexOf(document.activeElement as HTMLElement);
      const nextIndex = getNextTrapFocusIndex(activeIndex, focusable.length, event.shiftKey);
      if (nextIndex !== -1) {
        event.preventDefault();
        focusable[nextIndex].focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen, onClose, dialogRef, initialFocusRef, canClose]);
}

import { useEffect, type RefObject } from 'react';

/**
 * A11y cho modal/drawer controlled bằng React state (theo ui-skills §Modal + accessibility §4):
 * - Esc để đóng
 * - Focus trap trong panel (Tab/Shift+Tab không thoát ra ngoài)
 * - Trả focus về phần tử đã mở modal khi đóng
 *
 * Dùng: gọi trong component modal, truyền trạng thái mở, callback đóng, và ref tới panel.
 */
export function useModalA11y(
  isOpen: boolean,
  onClose: () => void,
  panelRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!isOpen) return;

    const triggerEl = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;

    const getFocusable = (): HTMLElement[] => {
      if (!panelRef.current) return [];
      return Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);
    };

    // Focus phần tử đầu tiên khi mở
    const focusables = getFocusable();
    (focusables[0] ?? panel)?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const items = getFocusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      // Trả focus về nút đã mở modal
      if (triggerEl && typeof triggerEl.focus === 'function') triggerEl.focus();
    };
  }, [isOpen, onClose, panelRef]);
}

import { useEffect, useState } from 'react';

/** Debounce giá trị input — web dùng 500ms cho ô tìm kiếm trang chủ. */
export function useDebounce<T>(value: T, delayMs = 500): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

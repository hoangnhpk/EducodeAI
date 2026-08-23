import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';

interface PaymentPollingOptions {
  /** Kích hoạt polling hay không (ví dụ: modal QR đang mở). */
  enabled: boolean;
  /** Chu kỳ kiểm tra — web dùng 3000ms. */
  intervalMs?: number;
  /**
   * Hàm kiểm tra một lần; trả về `true` nếu đã xong (thành công) để dừng polling.
   * Lỗi trong lúc poll được nuốt (giống web) để không gây nhiễu UX.
   */
  check: () => Promise<boolean>;
}

/**
 * Polling trạng thái thanh toán theo yêu cầu checklist:
 * - Dừng khi thành công, unmount hoặc app xuống background.
 * - Kiểm tra lại ngay khi app foreground trở lại.
 */
export function usePaymentPolling({ enabled, intervalMs = 3000, check }: PaymentPollingOptions) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const checkingRef = useRef(false);
  const doneRef = useRef(false);
  const checkRef = useRef(check);
  checkRef.current = check;

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const runCheck = useCallback(async () => {
    if (checkingRef.current || doneRef.current) return;
    checkingRef.current = true;
    try {
      const finished = await checkRef.current();
      if (finished) {
        doneRef.current = true;
        stop();
      }
    } catch {
      // Nuốt lỗi khi polling (giống web) — lần sau sẽ thử lại.
    } finally {
      checkingRef.current = false;
    }
  }, [stop]);

  const start = useCallback(() => {
    stop();
    if (doneRef.current) return;
    timerRef.current = setInterval(() => {
      void runCheck();
    }, intervalMs);
  }, [intervalMs, runCheck, stop]);

  useEffect(() => {
    if (!enabled) {
      stop();
      return;
    }

    doneRef.current = false;
    start();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        // Foreground: kiểm tra ngay một lần rồi tiếp tục chu kỳ.
        void runCheck();
        start();
      } else {
        stop();
      }
    });

    return () => {
      sub.remove();
      stop();
    };
  }, [enabled, runCheck, start, stop]);
}

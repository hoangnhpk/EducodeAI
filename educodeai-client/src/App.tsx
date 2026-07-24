import { useEffect } from "react";
import Router from "./router/index";
import { startSessionHub, stopSessionHub } from "./configs/sessionHub";

function App() {
  useEffect(() => {
    // G.9/G.10: SignalR SessionHub nhận event revoke/khóa realtime để logout UI ngay,
    // thay cho polling getDevices mỗi 10 giây (đã bỏ). Middleware + cache invalidation
    // vẫn là lớp enforcement backend nếu event bị mất; reconnect gọi sync endpoint một lần.
    void startSessionHub();

    return () => {
      void stopSessionHub();
    };
  }, []);

  return (
    <Router />
  );
}

export default App;

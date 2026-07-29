import { useEffect, useState } from "react";
import Router from "./router/index";
import { startSessionHub, stopSessionHub } from "./configs/sessionHub";
import { bootstrapAuth } from "./configs/authBootstrap";

function App() {
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void bootstrapAuth().finally(() => {
      if (!isMounted) return;
      setIsAuthReady(true);
      void startSessionHub();
    });

    return () => {
      isMounted = false;
      void stopSessionHub();
    };
  }, []);

  if (!isAuthReady) return null;

  return (
    <Router />
  );
}

export default App;

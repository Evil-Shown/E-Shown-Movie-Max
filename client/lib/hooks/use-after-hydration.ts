import { useEffect, useState } from "react";

/** True only after the client has mounted — safe for localStorage-driven UI. */
export function useAfterHydration() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return ready;
}

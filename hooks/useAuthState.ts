import { onAuthStateChanged } from "@firebase/auth";
import { useEffect, useState } from "react";

import { auth } from "../firebase";

export function useAuthState() {
  const [status, setStatus] = useState<
    "unauthenticated" | "authenticated" | "loading" | "error"
  >("loading");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          setStatus("authenticated");
          return;
        }

        setStatus("unauthenticated");
      },
      (_error) => {
        setStatus("error");
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  return status;
}

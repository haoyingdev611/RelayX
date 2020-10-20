import { useEffect } from "react";

export function useDidMount(callback: () => any): void {
  useEffect(() => {
    callback();
  }, []);
}

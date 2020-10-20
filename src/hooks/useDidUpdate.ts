import { useState, useEffect } from "react";
import { useDidMount } from "./useDidMount";

function useDidUpdate(callback: () => any, conditions: Array<any>): void {
  const [hasMounted, setHasMounted] = useState(false);

  useDidMount(() => {
    setHasMounted(true);
  });
  useEffect(() => {
    if (hasMounted) {
      callback();
    }
  }, conditions);
}

export { useDidUpdate };

"use client";

import { useEffect, useState } from "react";

export function Announcer({ message }: { message: string }) {
  const [text, setText] = useState("");

  useEffect(() => {
    const t = requestAnimationFrame(() => setText(message));
    return () => cancelAnimationFrame(t);
  }, [message]);

  return (
    <p role="status" aria-live="polite" className="sr-only">
      {text}
    </p>
  );
}

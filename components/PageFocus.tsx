"use client";

import { useEffect } from "react";

export function PageFocus({
  targetId,
  changeKey,
}: {
  targetId: string;
  changeKey: string;
}) {
  useEffect(() => {
    document.getElementById(targetId)?.focus({ preventScroll: true });
  }, [changeKey]);
  return null;
}

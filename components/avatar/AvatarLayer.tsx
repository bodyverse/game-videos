"use client";

import { Suspense, lazy } from "react";
import type { AvatarLayerProps } from "./AvatarLayerInner";

const LazyAvatarLayer = lazy(async () => {
  const reactModule = await import("react");
  const reactExport = (reactModule as any).default ?? reactModule;
  const internalsKey = "__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED";

  const ensureInternals = (target: any) => {
    if (!target || typeof target !== "object") return;
    const store = target[internalsKey] ?? (target[internalsKey] = {});
    if (typeof store === "object" && store !== null) {
      if (typeof store.S !== "function") {
        store.S = (_transition: unknown, returnValue: unknown) => returnValue;
      }
      if (!("T" in store)) {
        store.T = null;
      }
    }
  };

  ensureInternals(reactModule);
  ensureInternals(reactExport);

  return import("./AvatarLayerInner");
});

export type { AvatarLayerProps } from "./AvatarLayerInner";

export function AvatarLayer(props: AvatarLayerProps) {
  return (
    <Suspense fallback={null}>
      <LazyAvatarLayer {...props} />
    </Suspense>
  );
}

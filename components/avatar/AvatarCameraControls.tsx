"use client";

import { useAvatarCameraStore } from "@/stores/avatarCameraStore";

export function AvatarCameraControls() {
  const controlsEnabled = useAvatarCameraStore((state) => state.controlsEnabled);
  const setControlsEnabled = useAvatarCameraStore((state) => state.setControlsEnabled);
  const reset = useAvatarCameraStore((state) => state.reset);

  return (
    <div className="pointer-events-auto fixed right-6 top-6 z-50 flex max-w-xs flex-col items-end gap-3 text-white">
      <button
        type="button"
        onClick={() => setControlsEnabled(!controlsEnabled)}
        className="rounded-full bg-black/70 px-4 py-2 text-sm font-medium shadow-xl transition hover:bg-black/80"
      >
        {controlsEnabled ? "Disable Orbit Camera" : "Enable Orbit Camera"}
      </button>
      {controlsEnabled ? (
        <div className="w-64 rounded-3xl bg-black/70 p-4 text-xs shadow-2xl backdrop-blur">
          <p className="text-slate-200">Orbit controls active.</p>
          <ul className="mt-3 space-y-1 text-slate-300">
            <li>• Pan: click + drag (default)</li>
            <li>• Orbit: hold Shift while dragging (or use right-click drag)</li>
            <li>• Trackpads: two-finger drag to pan</li>
            <li>• Scroll / pinch to zoom</li>
          </ul>
          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={() => setControlsEnabled(false)}
              className="rounded-full bg-white/15 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/25"
            >
              Disable Orbit
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-full bg-white/15 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/25"
            >
              Reset Camera
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

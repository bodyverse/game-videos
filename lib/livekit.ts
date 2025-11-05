import type { Room } from "livekit-client";

export interface LiveKitConfig {
  url: string;
  token: string;
}

export function connectLiveKit(_: LiveKitConfig): Promise<Room | null> {
  // Placeholder until LiveKit backend token service is in place.
  if (process.env.NODE_ENV !== "production") {
    console.info("LiveKit connection stub called; implement when tokens are issued.");
  }
  return Promise.resolve(null);
}

"use client";

import { create } from "zustand";
import { useAvatarExperienceStore } from "@/stores/avatarExperienceStore";

type ReactionStatus = "idle" | "loading" | "ready" | "playing";

type AvatarReactionState = {
  scenePath: string | null;
  status: ReactionStatus;
  queueReaction: (scenePath: string) => void;
  setStatus: (status: ReactionStatus) => void;
  clearReaction: () => void;
};

export const useAvatarReactionStore = create<AvatarReactionState>((set) => ({
  scenePath: null,
  status: "idle",
  queueReaction: (scenePath) => {
    useAvatarExperienceStore.getState().setAvatarVisible(false);
    set({ scenePath, status: "loading" });
  },
  setStatus: (status) => set((state) => ({ ...state, status })),
  clearReaction: () => {
    useAvatarExperienceStore.getState().setAvatarVisible(true);
    set({ scenePath: null, status: "idle" });
  }
}));

"use client";

import { create } from "zustand";

type AvatarExperienceState = {
  avatarVisible: boolean;
  setAvatarVisible: (visible: boolean) => void;
};

export const useAvatarExperienceStore = create<AvatarExperienceState>((set) => ({
  avatarVisible: true,
  setAvatarVisible: (visible) => set({ avatarVisible: visible })
}));

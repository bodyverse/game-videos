import { create } from "zustand";

export type ReactionKind = "laugh" | "cry" | "fire" | "wow";

export type ReactionEvent = {
  id: string;
  emoji: ReactionKind;
  userUid: string;
  timestamp: number;
};

type SessionState = {
  isPlaying: boolean;
  currentTime: number;
  reactions: ReactionEvent[];
  participants: string[];
  setPlaying: (value: boolean) => void;
  setCurrentTime: (value: number) => void;
  addReaction: (event: ReactionEvent) => void;
  setParticipants: (list: string[]) => void;
  reset: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  isPlaying: false,
  currentTime: 0,
  reactions: [],
  participants: [],
  setPlaying: (value) => set({ isPlaying: value }),
  setCurrentTime: (value) => set({ currentTime: value }),
  addReaction: (event) => set((state) => ({ reactions: [event, ...state.reactions].slice(0, 50) })),
  setParticipants: (list) => set({ participants: list }),
  reset: () =>
    set({
      isPlaying: false,
      currentTime: 0,
      reactions: [],
      participants: []
    })
}));

import path from "path";
import { promises as fs } from "fs";
import type { FeedAvatarConfig } from "@/components/feed/FeedClient";
import { FeedClient } from "@/components/feed/FeedClient";

const avatarPresets: FeedAvatarConfig[] = [
  {
    modelPath: "/avatar/Rafa 01.glb",
    idleBlendshapes: {
      mouthSmileLeft: 0.25,
      mouthSmileRight: 0.25,
      eyeSquintLeft: 0.08,
      eyeSquintRight: 0.08
    },
    reactions: {
      love: {
        blendshapes: {
          mouthSmileLeft: 0.85,
          mouthSmileRight: 0.85,
          eyeSquintLeft: 0.32,
          eyeSquintRight: 0.32
        },
        duration: 1500
      },
      laugh: {
        blendshapes: {
          mouthSmileLeft: 0.92,
          mouthSmileRight: 0.92,
          jawOpen: 0.52,
          eyeSquintLeft: 0.4,
          eyeSquintRight: 0.4
        },
        duration: 1800
      },
      flair: {
        blendshapes: {
          browInnerUp: 0.45,
          mouthSmileLeft: 0.6,
          mouthSmileRight: 0.6
        },
        duration: 1400
      },
      summon: {
        blendshapes: {
          browInnerUp: 0.3,
          mouthSmileLeft: 0.5,
          mouthSmileRight: 0.5
        },
        duration: 1200
      },
      intro: {
        blendshapes: {
          mouthSmileLeft: 0.35,
          mouthSmileRight: 0.35,
          eyeBlinkLeft: 0.1,
          eyeBlinkRight: 0.1
        },
        duration: 1100
      },
      mid: {
        blendshapes: {
          browInnerUp: 0.5,
          jawOpen: 0.4
        },
        duration: 1300
      },
      climax: {
        blendshapes: {
          jawOpen: 0.62,
          eyeWideLeft: 0.55,
          eyeWideRight: 0.55
        },
        duration: 1600
      },
      pause: {
        blendshapes: {
          mouthSmileLeft: 0.15,
          mouthSmileRight: 0.15,
          eyeBlinkLeft: 0.3,
          eyeBlinkRight: 0.3
        },
        duration: 1200
      }
    }
  },
  {
    modelPath: "/avatar/Siri 01.glb",
    idleBlendshapes: {
      mouthSmileLeft: 0.18,
      mouthSmileRight: 0.18,
      eyeSquintLeft: 0.05,
      eyeSquintRight: 0.05
    },
    reactions: {
      love: {
        blendshapes: {
          mouthSmileLeft: 0.78,
          mouthSmileRight: 0.78,
          eyeSquintLeft: 0.28,
          eyeSquintRight: 0.28
        },
        duration: 1500
      },
      laugh: {
        blendshapes: {
          mouthSmileLeft: 0.88,
          mouthSmileRight: 0.88,
          jawOpen: 0.48,
          eyeSquintLeft: 0.36,
          eyeSquintRight: 0.36
        },
        duration: 1700
      },
      flair: {
        blendshapes: {
          browOuterUpLeft: 0.4,
          browOuterUpRight: 0.4,
          eyeWideLeft: 0.5,
          eyeWideRight: 0.5
        },
        duration: 1450
      },
      summon: {
        blendshapes: {
          browInnerUp: 0.25,
          mouthSmileLeft: 0.42,
          mouthSmileRight: 0.42
        },
        duration: 1150
      },
      intro: {
        blendshapes: {
          mouthSmileLeft: 0.28,
          mouthSmileRight: 0.28,
          eyeBlinkLeft: 0.1,
          eyeBlinkRight: 0.1
        },
        duration: 1000
      },
      mid: {
        blendshapes: {
          browInnerUp: 0.4,
          jawOpen: 0.36
        },
        duration: 1250
      },
      climax: {
        blendshapes: {
          jawOpen: 0.58,
          eyeWideLeft: 0.6,
          eyeWideRight: 0.6
        },
        duration: 1650
      },
      pause: {
        blendshapes: {
          mouthSmileLeft: 0.12,
          mouthSmileRight: 0.12,
          eyeBlinkLeft: 0.26,
          eyeBlinkRight: 0.26
        },
        duration: 1150
      }
    }
  }
];

async function loadVideos() {
  const publicDir = path.join(process.cwd(), "public", "videos");

  try {
    const entries = await fs.readdir(publicDir);
    const mp4s = entries.filter((file) => file.toLowerCase().endsWith(".mp4"));

    if (mp4s.length === 0) {
      throw new Error("No video files in public/videos");
    }

    return mp4s.map((file, index) => {
      const base = file.replace(/_/g, " ").replace(/\.[^.]+$/, "");
      const title = base.length > 48 ? `${base.slice(0, 45)}…` : base;
      const avatar = avatarPresets[index % avatarPresets.length];

      return {
        id: `video-${index}`,
        src: `/videos/${file}`,
        title,
        description: "Swipe through curated BodyVerse shorts engineered for landscape-first viewing.",
        avatar
      };
    });
  } catch (error) {
    console.warn("[feed] Falling back to demo playlist", error);
    const fallbackAvatar = avatarPresets[0];
    return [
      {
        id: "demo-1",
        src: "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4",
        title: "Demo: Mt Baker",
        description: "A landscape-first highlight while we prepare your local library.",
        avatar: fallbackAvatar
      },
      {
        id: "demo-2",
        src: "https://storage.googleapis.com/coverr-main/mp4/Street-Lights.mp4",
        title: "Demo: Street Lights",
        description: "Nighttime vibes to preview the feed experience.",
        avatar: avatarPresets[1 % avatarPresets.length]
      }
    ];
  }
}

export default async function FeedPage() {
  const videos = await loadVideos();

  return (
    <main className="min-h-screen bg-black text-white">
      <FeedClient videos={videos} />
    </main>
  );
}

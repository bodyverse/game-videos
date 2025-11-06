"use client";

import { IconCamera, IconFocusFrame, IconX } from "@/components/icons";
import { FeedActionStack } from "@/components/feed/ActionStack";
import { useAvatarCameraStore } from "@/stores/avatarCameraStore";

export function AvatarCameraControls() {
  const controlsEnabled = useAvatarCameraStore((state) => state.controlsEnabled);
  const setControlsEnabled = useAvatarCameraStore((state) => state.setControlsEnabled);
  const setStaticView = useAvatarCameraStore((state) => state.setStaticView);

  const handleToggle = () => {
    setControlsEnabled(!controlsEnabled);
  };

  const handleResetView = () => {
    setStaticView();
  };

  return (
    <FeedActionStack direction="row" className="fixed right-6 top-6 z-50 gap-6">
      {controlsEnabled ? (
        <FeedActionStack.Button
          icon={<IconFocusFrame size={23} />}
          label="Reset camera view"
          onClick={handleResetView}
        />
      ) : null}
      <FeedActionStack.Button
        icon={controlsEnabled ? <IconX size={18} /> : <IconCamera size={23} />}
        label={controlsEnabled ? "Close camera controls" : "Open camera controls"}
        onClick={handleToggle}
      />
    </FeedActionStack>
  );
}

import { forwardRef } from "react";
import type { ReactNode, SVGProps } from "react";

type IconProps = Omit<SVGProps<SVGSVGElement>, "ref"> & {
  size?: number | string;
  strokeWidth?: number;
};

function createIcon(children: ReactNode) {
  return forwardRef<SVGSVGElement, IconProps>(function Icon(
    { size = 24, strokeWidth = 1.6, ...rest },
    ref
  ) {
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        {...rest}
      >
        {children}
      </svg>
    );
  });
}

export const IconPlay = createIcon(
  <polygon points="7 5 19 12 7 19 7 5" fill="currentColor" stroke="none" />
);

export const IconVolume = createIcon(
  <>
    <path d="M5 9h3l4-3v12l-4-3H5z" fill="currentColor" stroke="none" />
    <path d="M16 9a3 3 0 0 1 0 6" />
    <path d="M18.5 7.5a5.5 5.5 0 0 1 0 9" />
  </>
);

export const IconVolumeMute = createIcon(
  <>
    <path d="M5 9h3l4-3v12l-4-3H5z" fill="currentColor" stroke="none" />
    <line x1="16" y1="9" x2="22" y2="15" />
    <line x1="22" y1="9" x2="16" y2="15" />
  </>
);

export const IconSpark = createIcon(
  <path d="M13 2 4 14h7l-1 8 10-12h-7z" fill="currentColor" stroke="none" />
);

export const IconHeart = createIcon(
  <path
    d="M12 20.5c-4.4-3.3-7.5-6.5-7.5-10 0-2.3 1.7-4 3.8-4 1.6 0 3 .9 3.7 2.2.7-1.3 2.1-2.2 3.7-2.2 2.1 0 3.8 1.7 3.8 4 0 3.5-3.1 6.7-7.5 10z"
    fill="currentColor"
    stroke="none"
  />
);

export const IconThumbUp = createIcon(
  <>
    <path d="M7 10v10" />
    <rect x="3" y="10" width="4" height="10" rx="1" />
    <path d="M7 10 12 4a1.5 1.5 0 0 1 2.6 1.1l-.6 4.7H20a2 2 0 0 1 2 2.3l-1 6a2 2 0 0 1-2 1.9H9" />
  </>
);

export const IconThumbDown = createIcon(
  <>
    <path d="M7 14V4" />
    <rect x="3" y="4" width="4" height="10" rx="1" />
    <path d="M7 14 12 20a1.5 1.5 0 0 0 2.6-1.1l-.6-4.7H20a2 2 0 0 0 2-2.3l-1-6A2 2 0 0 0 19 4H9" />
  </>
);

export const IconLaugh = createIcon(
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M8.5 14.5s1.5 1.9 3.5 1.9 3.5-1.9 3.5-1.9" />
    <circle cx="9.5" cy="10" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="14.5" cy="10" r="0.9" fill="currentColor" stroke="none" />
  </>
);

export const IconTear = createIcon(
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9 15c1.2 1 3.8 1 6 0" />
    <circle cx="9" cy="10" r="0.85" fill="currentColor" stroke="none" />
    <circle cx="15" cy="10" r="0.85" fill="currentColor" stroke="none" />
    <path
      d="M15.4 13.4c1.1 1.2 1.5 2.3.3 3.1-1 .7-1.9-.2-1.9-.2"
      fill="none"
    />
  </>
);

export const IconFlame = createIcon(
  <path
    d="M12 21c3.5-2.6 5.5-5.2 5.5-8.1 0-3-2.2-5-4.1-6.9-1.5-1.6-1.4-3.2-1.4-3.2s-4.5 3-4.5 7.1c0 1.3.6 2.6 1.5 3.4-.1-1.6.5-3 1.5-3.9-.4 3.8 1.2 4.9 2.4 5.7 1 .7 1.2 2.1.2 3.1-.7.6-1.9.7-2.5-.1-.2 1.5.4 2.3 1.4 2.9z"
    fill="currentColor"
    stroke="none"
  />
);

export const IconBurst = createIcon(
  <>
    <polygon points="12 3 13.8 8.2 19 10 13.8 11.8 12 17 10.2 11.8 5 10 10.2 8.2 12 3" />
    <line x1="12" y1="3" x2="12" y2="6.5" />
    <line x1="12" y1="17" x2="12" y2="14.5" />
    <line x1="5" y1="10" x2="8.5" y2="10" />
    <line x1="19" y1="10" x2="15.5" y2="10" />
  </>
);

export const IconCamera = createIcon(
  <>
    <path d="M4 7h3l2-3h6l2 3h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
    <circle cx="12" cy="13.5" r="3.5" />
    <circle cx="18.5" cy="10.5" r="0.6" fill="currentColor" stroke="none" />
  </>
);

export const IconX = createIcon(
  <>
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </>
);

export const IconFocusFrame = createIcon(
  <>
    <path d="M4 9V6a2 2 0 0 1 2-2h3" />
    <path d="M20 9V6a2 2 0 0 0-2-2h-3" />
    <path d="M4 15v3a2 2 0 0 0 2 2h3" />
    <path d="M20 15v3a2 2 0 0 1-2 2h-3" />
    <circle cx="12" cy="12" r="3.2" />
  </>
);

export const IconReaction = createIcon(
  <>
    <circle cx="12" cy="12" r="4.4" />
    <path d="M12 6V4.5" />
    <path d="M12 19.5V18" />
    <path d="M6 12H4.5" />
    <path d="M19.5 12H18" />
    <path d="m8.4 8.4-1.1-1.1" />
    <path d="m16.7 16.7-1.1-1.1" />
    <path d="m15.6 8.4 1.1-1.1" />
    <path d="m7.3 16.7 1.1-1.1" />
  </>
);

export const IconPlayerPlay = IconPlay;
export const IconPlayerPause = createIcon(
  <>
    <rect x="7" y="5" width="3" height="14" rx="1" />
    <rect x="14" y="5" width="3" height="14" rx="1" />
  </>
);
export const IconPlayerStop = createIcon(<rect x="6" y="6" width="12" height="12" rx="1.5" />);
export const IconChevronDown = createIcon(<polyline points="6 9 12 15 18 9" />);

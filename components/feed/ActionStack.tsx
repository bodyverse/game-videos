"use client";

import clsx from "clsx";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type FeedActionButtonProps = ComponentPropsWithoutRef<"button"> & {
  icon: ReactNode;
  label: string;
};

const FeedActionButton = forwardRef<HTMLButtonElement, FeedActionButtonProps>(
  ({ icon, label, className, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={clsx(
          "inline-flex items-center justify-center text-white transition hover:text-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
          className
        )}
        {...rest}
      >
        {icon}
        <span className="sr-only">{label}</span>
      </button>
    );
  }
);

type FeedActionStackProps = {
  children: ReactNode;
  position?: "top" | "center" | "bottom";
  className?: string;
  direction?: "row" | "column";
};

export function FeedActionStack({ children, position = "top", className, direction = "column" }: FeedActionStackProps) {
  const verticalClass =
    position === "center"
      ? "top-1/2 -translate-y-1/2"
      : position === "bottom"
      ? "bottom-6"
      : "top-6";

  const flexClass = direction === "row" ? "flex-row items-center" : "flex-col items-center";

  return (
    <div className={clsx("pointer-events-auto flex text-white", flexClass, verticalClass, className)}>
      {children}
    </div>
  );
}

FeedActionStack.Button = FeedActionButton;

export type { FeedActionButtonProps };

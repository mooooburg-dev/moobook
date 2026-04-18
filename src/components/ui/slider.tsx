"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

function Slider({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type="range"
      data-slot="slider"
      className={cn(
        "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary",
        "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow",
        className
      )}
      {...props}
    />
  );
}

export { Slider };

"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils"; // Assuming you have this utility

const ContainedPopoverContent = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
    containerSelector?: string;
  }
>(
  (
    {
      className,
      align = "center",
      sideOffset = 4,
      containerSelector,
      ...props
    },
    ref
  ) => {
    const [container, setContainer] = React.useState<HTMLElement | null>(null);

    React.useLayoutEffect(() => {
      // Use useLayoutEffect for DOM measurements/manipulation if needed before paint
      if (typeof document !== "undefined" && containerSelector) {
        const foundContainer = document.querySelector(containerSelector);
        if (foundContainer instanceof HTMLElement) {
          setContainer(foundContainer);
        } else {
          console.warn(
            `Popover container element with selector "${containerSelector}" not found. Portalling to body.`
          );
          setContainer(document.body); // Fallback
        }
      } else {
        setContainer(document.body); // Default if no selector or SSR
      }
    }, [containerSelector]);

    if (!container) return null; // Don't render until container is determined

    return (
      <PopoverPrimitive.Portal container={container}>
        <PopoverPrimitive.Content
          ref={ref}
          align={align}
          sideOffset={sideOffset}
          className={cn(
            "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            className // Allow overriding styles
          )}
          // Prevent Dialog/Sheet from closing when clicking inside Popover
          onInteractOutside={(e) => e.preventDefault()}
          {...props}
        />
      </PopoverPrimitive.Portal>
    );
  }
);
ContainedPopoverContent.displayName = "ContainedPopoverContent";

export { ContainedPopoverContent };

import * as React from "react"

import { cn } from "@/lib/utils"

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal" | "both"
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, orientation = "vertical", ...props }, ref) => {
    const overflowClass =
      orientation === "both"
        ? "overflow-auto"
        : orientation === "horizontal"
        ? "overflow-x-auto overflow-y-hidden"
        : "overflow-y-auto overflow-x-hidden"

    return (
      <div
        ref={ref}
        className={cn(
          "relative",
          overflowClass,
          "scrollbar-thin",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ScrollArea.displayName = "ScrollArea"

export { ScrollArea }

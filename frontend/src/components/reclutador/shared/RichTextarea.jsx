import React from "react";
import { cn } from "../../../lib/utils";

export const RichTextarea = React.forwardRef(function RichTextarea(
  { className, label, ...props },
  ref
) {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}

      <div className="rounded-xl border bg-card focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
        <div className="flex items-center gap-2 border-b px-3 py-2 bg-muted/30">
          <button
            type="button"
            className="h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground font-bold"
          >
            B
          </button>

          <button
            type="button"
            className="h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground italic"
          >
            I
          </button>

          <button
            type="button"
            className="h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground underline"
          >
            U
          </button>

          <div className="w-px h-4 bg-border mx-1" />

          <button
            type="button"
            className="h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground"
          >
            —
          </button>
        </div>

        <textarea
          ref={ref}
          className={cn(
            "flex min-h-37.5 w-full rounded-b-xl bg-transparent px-3 py-3 text-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-y",
            className
          )}
          {...props}
        />
      </div>
    </div>
  );
});

RichTextarea.displayName = "RichTextarea";
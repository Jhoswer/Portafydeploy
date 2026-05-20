import { cn } from "../../../lib/utils";

export function Tag({ children, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground",
        className
      )}
    >
      {children}
    </span>
  );
}

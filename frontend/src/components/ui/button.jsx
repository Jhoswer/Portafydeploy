import React from "react";
import { Slot } from "@radix-ui/react-slot";

const VARIANT = {
  red:         "pf-btn--red",
  destructive: "pf-btn--red",
  ghost:       "pf-btn--ghost",
  white:       "pf-btn--ghost",
  glass:       "pf-btn--glass",
  outline:     "pf-btn--outline",
};

const SIZE = {
  default: "",
  sm:      "pf-btn--sm",
  lg:      "pf-btn--lg",
  xl:      "pf-btn--xl",
  full:    "pf-btn--full",
};

const Button = React.forwardRef(function Button(
  { className = "", variant = "red", size = "default", asChild = false, ...props },
  ref
) {
  const Comp = asChild ? Slot : "button";
  const classes = [
    "pf-btn",
    VARIANT[variant] ?? "pf-btn--red",
    SIZE[size] ?? "",
    className,
  ].filter(Boolean).join(" ");

  return <Comp ref={ref} className={classes} {...props} />;
});

Button.displayName = "Button";

export { Button };
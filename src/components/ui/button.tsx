import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:translate-y-[1px]",
  {
    variants: {
      variant: {
        default:
          "bg-[image:var(--gradient-gold)] text-[#111B2E] font-bold shadow-[var(--shadow-gold)] hover:brightness-105 hover:-translate-y-0.5",
        gold: "bg-[image:var(--gradient-gold)] text-[#111B2E] font-bold shadow-[var(--shadow-gold)] hover:brightness-105 hover:-translate-y-0.5",
        coral:
          "bg-[image:var(--gradient-coral)] text-white font-bold shadow-[var(--shadow-coral)] hover:brightness-105 hover:-translate-y-0.5",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-[#E4DCB5] bg-card text-[#111B2E] shadow-sm hover:bg-secondary hover:border-gold",
        secondary: "bg-secondary text-[#111B2E] border border-border shadow-sm hover:bg-muted",
        ghost: "text-[#111B2E] hover:bg-secondary hover:text-gold",
        link: "text-coral underline-offset-4 hover:underline",
        hero: "bg-[image:var(--gradient-gold)] text-[#111B2E] font-bold shadow-[var(--shadow-gold)] hover:brightness-105 hover:-translate-y-0.5",
        navy: "surface-navy text-white border border-gold/30 hover:brightness-110",
        soft: "bg-secondary text-[#111B2E] border border-border hover:border-gold hover:bg-card",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8.5 rounded-lg px-3 text-xs",
        lg: "h-11.5 rounded-xl px-7 text-sm font-bold",
        xl: "h-13 rounded-2xl px-9 text-base font-bold",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

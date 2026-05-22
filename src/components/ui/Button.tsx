import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-400 ease-apple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap select-none",
  {
    variants: {
      variant: {
        // Primary — light pill with dark text (Netflix "Reproducir")
        primary:
          "btn-sheen bg-white text-ink hover:bg-white/90 active:bg-white/85 shadow-[0_14px_36px_-10px_rgba(0,0,0,0.55)] hover:shadow-[0_22px_48px_-12px_rgba(0,0,0,0.65)] hover:-translate-y-0.5",
        // Gold — accent CTA, dark text on gold
        gold:
          "btn-sheen bg-gold-400 text-ink hover:bg-gold-300 active:bg-gold-500 shadow-[0_12px_32px_-8px_rgba(212,175,55,0.5)] hover:shadow-[0_22px_48px_-10px_rgba(212,175,55,0.65)] hover:-translate-y-0.5",
        // Secondary — glass pill with white text (Netflix "Más información")
        secondary:
          "glass text-white hover:bg-white/15 hover:border-white/40 hover:-translate-y-0.5",
        // Ghost — translucent border, white text
        ghost:
          "bg-white/5 text-white border border-white/15 hover:border-white/40 hover:bg-white/10 backdrop-blur-md",
        // Subtle — soft gray pill
        subtle:
          "bg-white/8 text-white hover:bg-white/15 backdrop-blur-md",
        // Link — text-only
        link:
          "bg-transparent text-gold-300 hover:text-gold-400 underline-offset-4 hover:underline p-0",
        // Danger — red on dark
        danger:
          "bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25 backdrop-blur-md",
      },
      size: {
        sm: "h-9 px-4 text-sm rounded-full",
        md: "h-11 px-6 text-[15px] rounded-full",
        lg: "h-14 px-8 text-base rounded-full",
        icon: "h-10 w-10 rounded-full",
        "icon-sm": "h-8 w-8 rounded-full",
        "icon-lg": "h-12 w-12 rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

type Variants = VariantProps<typeof buttonVariants>;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & Variants;
type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & Variants & { href: string };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, ...props },
  ref
) {
  return (
    <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
});

export const ButtonLink = forwardRef<HTMLAnchorElement, AnchorProps>(function ButtonLink(
  { className, variant, size, ...props },
  ref
) {
  return (
    <a ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
});

export { buttonVariants };

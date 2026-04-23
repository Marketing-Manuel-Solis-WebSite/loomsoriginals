import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-400 ease-apple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-gold-500 text-navy-950 hover:bg-gold-400 active:bg-gold-600 shadow-[0_8px_24px_-4px_rgba(212,175,55,0.4)] hover:shadow-[0_16px_40px_-8px_rgba(212,175,55,0.55)] hover:-translate-y-0.5",
        secondary:
          "glass text-ivory-50 hover:bg-navy-700/60 hover:border-gold-500/40 hover:-translate-y-0.5",
        ghost:
          "bg-transparent text-ivory-50 border border-gold-500/40 hover:border-gold-400 hover:bg-gold-500/8 hover:text-gold-400",
        subtle:
          "bg-navy-800/40 text-ivory-200 hover:bg-navy-700/60 hover:text-ivory-50",
        link:
          "bg-transparent text-gold-500 hover:text-gold-400 underline-offset-4 hover:underline p-0",
        danger:
          "bg-red-500/10 text-red-300 border border-red-500/30 hover:bg-red-500/20",
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

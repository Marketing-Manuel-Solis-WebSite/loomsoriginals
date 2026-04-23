import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-400 ease-apple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap select-none",
  {
    variants: {
      variant: {
        primary:
          "btn-sheen bg-ink text-white hover:bg-gray-800 active:bg-gray-900 shadow-[0_12px_32px_-8px_rgba(9,9,11,0.25)] hover:shadow-[0_20px_40px_-10px_rgba(9,9,11,0.3)] hover:-translate-y-0.5",
        gold:
          "btn-sheen bg-gold-400 text-ink hover:bg-gold-300 active:bg-gold-500 shadow-[0_12px_32px_-8px_rgba(212,175,55,0.45)] hover:shadow-[0_20px_40px_-10px_rgba(212,175,55,0.55)] hover:-translate-y-0.5",
        secondary:
          "glass text-ink hover:bg-white/90 hover:border-gold-400/40 hover:-translate-y-0.5",
        ghost:
          "bg-transparent text-ink border border-gray-200 hover:border-ink hover:bg-gray-50",
        subtle:
          "bg-gray-100 text-ink hover:bg-gray-200",
        link:
          "bg-transparent text-ink hover:text-gold-600 underline-offset-4 hover:underline p-0",
        danger:
          "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100",
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

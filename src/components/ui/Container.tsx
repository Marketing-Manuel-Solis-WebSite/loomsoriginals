import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef, ElementType } from "react";

type ContainerProps<T extends ElementType> = {
  as?: T;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  children?: React.ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

const sizeMap: Record<NonNullable<ContainerProps<"div">["size"]>, string> = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
  xl: "max-w-[1440px]",
  full: "max-w-none",
};

export function Container<T extends ElementType = "div">({
  as,
  size = "lg",
  className,
  children,
  ...rest
}: ContainerProps<T>) {
  const Component = (as ?? "div") as ElementType;
  return (
    <Component
      className={cn("mx-auto w-full px-8 sm:px-14 md:px-24 lg:px-40 xl:px-56 2xl:px-72", sizeMap[size], className)}
      {...rest}
    >
      {children}
    </Component>
  );
}

"use client";

import { cn } from "@/lib/utils";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ivory-200/80">
        {label} {required ? <span className="text-gold-500">*</span> : null}
      </span>
      {children}
      {hint ? <span className="text-[12px] text-ivory-200/55">{hint}</span> : null}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-11 w-full rounded-full border border-white/10 bg-navy-900/60 px-5 text-[14px] text-ivory-50 outline-none transition-colors focus:border-gold-500/60 placeholder:text-ivory-200/40",
        props.className
      )}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-navy-900/60 p-4 text-[14px] leading-relaxed text-ivory-50 outline-none transition-colors focus:border-gold-500/60 placeholder:text-ivory-200/40 min-h-[110px]",
        props.className
      )}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-11 w-full rounded-full border border-white/10 bg-navy-900/60 px-5 text-[14px] text-ivory-50 outline-none focus:border-gold-500/60",
        props.className
      )}
    />
  );
}

export function Checkbox({
  name,
  defaultChecked,
  children,
}: {
  name: string;
  defaultChecked?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="flex items-center gap-3 text-[14px] text-ivory-100">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-white/20 bg-navy-900 text-gold-500 accent-gold-500"
      />
      {children}
    </label>
  );
}

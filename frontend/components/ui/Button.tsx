"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-accent text-white shadow-glow hover:brightness-110 active:scale-[0.98]",
  secondary:
    "glass text-slate-100 hover:border-white/25 hover:bg-white/5 active:scale-[0.98]",
  ghost: "text-slate-300 hover:text-white hover:bg-white/5",
  danger: "bg-danger/90 text-white hover:bg-danger active:scale-[0.98]",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

type ButtonProps = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & {
    href?: undefined;
  };

type LinkProps = BaseProps & {
  href: string;
  external?: boolean;
};

export function Button(props: ButtonProps | LinkProps) {
  const { variant = "primary", size = "md", className, children } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if (props.href !== undefined) {
    const { external } = props;
    if (external) {
      return (
        <a href={props.href} className={classes} target="_blank" rel="noreferrer">
          {children}
        </a>
      );
    }
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  const {
    variant: _variant,
    size: _size,
    className: _className,
    children: _children,
    href: _href,
    ...rest
  } = props;
  void _variant;
  void _size;
  void _className;
  void _children;
  void _href;

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}

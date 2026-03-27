import * as React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-1.5 rounded-full font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes: Record<string, string> = { sm: "px-3 py-1.5 text-xs", md: "px-5 py-2.5 text-sm", lg: "px-7 py-3 text-base" };
  const variants: Record<string, string> = {
    primary: "gradient-btn px-6 py-2.5",
    outline: "border border-slate-500/50 bg-slate-800/30 text-slate-200 hover:bg-slate-700/50 hover:border-slate-400/60 focus-visible:ring-purple-500",
    ghost: "text-slate-300 hover:bg-slate-700/30 focus-visible:ring-slate-500"
  };
  return <button className={`${base} ${sizes[size]} ${variants[variant]} ${className || ""}`} {...props} />;
}

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "glass" | "hover";
}

export function Card({
  children,
  className = "",
  variant = "default",
}: CardProps) {
  const baseStyles = "rounded-3xl p-8";

  const variants = {
    default: "bg-white shadow-lg",
    glass: "bg-white/60 backdrop-blur-lg border border-white/40 shadow-xl",
    hover:
      "bg-white shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300",
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}

"use client";
import "../../app/globals.css";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

// Extending HTMLMotionProps<"button"> lets TypeScript know it handles 
// all standard HTML attributes AND all Framer Motion props automatically.
type ButtonProps = HTMLMotionProps<"button"> & {
  children: React.ReactNode;
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger";
};

export default function Button({
  children,
  loading = false,
  disabled = false,
  variant = "primary",
  className, // Capture custom classes passed from the outside
  ...props   // Capture onClick, etc.
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      disabled={loading || disabled}
      className={clsx(
        // Base layout styles
        "flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 shadow-md",
        "disabled:cursor-not-allowed disabled:opacity-50",

        // Default variant styles if nothing overrides them from outside
        variant === "primary" &&
          "bg-emerald-500 text-white hover:bg-emerald-400",

        variant === "secondary" &&
          "border border-slate-700 bg-slate-900 text-white hover:bg-slate-800",

        variant === "danger" &&
          "bg-red-500 text-white hover:bg-red-400",
        
        // Custom classes injected dynamically will append/override here!
        className 
      )}
      {...props} // Spreads everything else (onClick, key, etc.) cleanly
    >
      {loading && (
        <Loader2
          className="animate-spin"
          size={18}
          {...({} as any)} // Satisfies standard React SVG typings if lucide trips
        />
      )}

      {children}
    </motion.button>
  );
}
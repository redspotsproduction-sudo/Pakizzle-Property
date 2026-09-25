import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-[#0F766E] focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[#0F766E] text-white hover:bg-[#0D9488] shadow-sm",
        primary:
          "bg-[#0F766E] text-white hover:bg-[#0D9488] shadow-sm",
        secondary:
          "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700",
        outline:
          "border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
        ghost:
          "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 shadow-sm",
        link: "text-[#0F766E] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends ButtonPrimitive.Props,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  loading?: boolean;
}

function Button({
  className,
  variant = "default",
  size = "default",
  isLoading,
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isBusy = isLoading || loading;

  return (
    <ButtonPrimitive
      data-slot="button"
      disabled={disabled || isBusy}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {isBusy && <Loader2 className="size-4 animate-spin text-current" />}
      {children}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }

import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-[#5B2A86] focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#5B2A86] to-[#1A1526] text-white hover:brightness-110 shadow-md border border-[#C9A227]/30",
        primary:
          "bg-gradient-to-r from-[#5B2A86] to-[#1A1526] text-white hover:brightness-110 shadow-md border border-[#C9A227]/30",
        secondary:
          "bg-white/90 text-[#1A1526] hover:bg-[#FAF3E6] dark:bg-[#1E1E20] dark:text-[#F5F5F7] dark:hover:bg-[#242426] border border-slate-200 dark:border-white/10 shadow-xs",
        outline:
          "border border-[#5B2A86]/25 dark:border-white/10 bg-transparent text-[#1A1526] dark:text-[#F5F5F7] hover:bg-[#FAF3E6] dark:hover:bg-white/5",
        ghost:
          "text-[#1A1526] dark:text-[#F5F5F7] hover:bg-[#FAF3E6] dark:hover:bg-white/5",
        destructive:
          "bg-[#D93A45] text-white hover:bg-red-700 shadow-sm",
        link: "text-[#5B2A86] dark:text-[#F5F5F7] underline-offset-4 hover:underline",
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

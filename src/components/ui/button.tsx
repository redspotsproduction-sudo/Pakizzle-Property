import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 outline-none select-none focus-ring-pakizzle active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "pakizzle-button-primary shadow-md border border-white/10",
        primary:
          "pakizzle-button-primary shadow-md border border-white/10",
        secondary:
          "bg-apple-surface text-apple-text hover:bg-apple-gray border border-apple-border shadow-xs",
        outline:
          "border border-apple-border bg-transparent text-apple-text hover:bg-apple-gray",
        ghost:
          "text-apple-text hover:bg-apple-gray",
        destructive:
          "bg-apple-red text-white hover:opacity-90 shadow-sm",
        link: "text-apple-blue underline-offset-4 hover:underline",
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

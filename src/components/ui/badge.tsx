import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "bg-apple-green/10 text-[var(--apple-green)] border-apple-green/30 dark:bg-apple-surface/50 dark:text-emerald-300 dark:border-apple-green",
        primary:
          "bg-[var(--apple-green)] text-white border-transparent",
        featured:
          "bg-gold-decoration/10 text-[var(--warning)] border-gold-decoration/30 dark:bg-apple-surface/50 dark:text-gold-decoration/40 dark:border-amber-800 font-semibold",
        accent:
          "bg-gold-decoration/10 text-[var(--warning)] border-gold-decoration/30 dark:bg-apple-surface/50 dark:text-gold-decoration/40 dark:border-amber-800",
        active:
          "bg-apple-green/10 text-apple-green border-apple-green/30 dark:bg-apple-surface/50 dark:text-emerald-300 dark:border-apple-green",
        success:
          "bg-apple-green/10 text-apple-green border-apple-green/30 dark:bg-apple-surface/50 dark:text-emerald-300 dark:border-apple-green",
        pending:
          "bg-gold-decoration/10 text-amber-700 border-gold-decoration/30 dark:bg-apple-surface/50 dark:text-gold-decoration/40 dark:border-amber-800",
        warning:
          "bg-gold-decoration/10 text-amber-700 border-gold-decoration/30 dark:bg-apple-surface/50 dark:text-gold-decoration/40 dark:border-amber-800",
        sold:
          "bg-apple-gray text-apple-text-muted border-apple-border dark:bg-apple-surface dark:text-apple-text-muted dark:border-apple-text-muted",
        destructive:
          "bg-apple-red/10 text-apple-red border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
        verified:
          "bg-apple-green/10 text-[var(--apple-green)] border-apple-green/30 dark:bg-apple-surface/50 dark:text-apple-green dark:border-teal-800",
        outline:
          "border-apple-border text-apple-text-muted dark:border-apple-text-muted dark:text-apple-border bg-transparent",
        secondary:
          "bg-apple-gray text-apple-surface border-apple-border dark:bg-apple-surface dark:text-apple-border dark:border-apple-text-muted",
        ghost:
          "border-transparent text-apple-text-muted dark:text-apple-text-muted hover:bg-apple-gray dark:hover:bg-apple-surface",
        link: "text-[var(--apple-green)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-6 px-2.5 text-xs",
        sm: "h-5 px-2 text-[11px]",
        lg: "h-7 px-3 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }

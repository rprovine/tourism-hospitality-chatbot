import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-gray-300",
        success: "border-green-600 bg-green-600 text-white hover:bg-green-700",
        warning: "border-yellow-600 bg-yellow-600 text-white hover:bg-yellow-700",
        info: "border-blue-600 bg-blue-600 text-white hover:bg-blue-700",
        purple: "border-purple-600 bg-purple-600 text-white hover:bg-purple-700",
        green: "border-green-600 bg-green-600 text-white hover:bg-green-700",
        yellow: "border-yellow-600 bg-yellow-600 text-white hover:bg-yellow-700",
        blue: "border-blue-600 bg-blue-600 text-white hover:bg-blue-700",
        red: "border-red-600 bg-red-600 text-white hover:bg-red-700",
        gray: "border-gray-600 bg-gray-600 text-white hover:bg-gray-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
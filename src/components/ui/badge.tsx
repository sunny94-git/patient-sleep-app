import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border transition-colors",
  {
    variants: {
      variant: {
        default: "bg-brand-50 text-brand-700 border-brand-200",
        success: "bg-green-50 text-green-600 border-green-200",
        warning: "bg-yellow-50 text-yellow-600 border-yellow-200",
        orange: "bg-orange-50 text-orange-600 border-orange-200",
        danger: "bg-red-50 text-red-600 border-red-200",
        secondary: "bg-gray-100 text-gray-600 border-gray-200",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

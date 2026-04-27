import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:   'bg-[#4A90D9] text-white hover:bg-[#3B82F6] active:bg-[#2563EB]',
        secondary: 'bg-white text-[#4A90D9] border border-[#4A90D9] hover:bg-[#EFF6FF]',
        ghost:     'bg-transparent text-gray-600 hover:bg-gray-100',
        danger:    'bg-[#EF4444] text-white hover:bg-red-600',
      },
      size: {
        sm: 'text-sm px-3 py-1.5 rounded-lg min-h-[36px]',
        md: 'text-base px-6 py-3 rounded-lg min-h-[48px]',
        lg: 'text-base px-8 py-3 rounded-lg min-h-[52px] w-full',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }

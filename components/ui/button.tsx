import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600",
  {
    variants: {
      variant: {
        default:
          "bg-blue-700 text-white hover:bg-blue-800 hover:scale-[1.02] shadow-md",

        secondary:
          "bg-orange-500 text-white hover:bg-orange-600 hover:scale-[1.02]",

        outline:
          "border border-slate-300 bg-white hover:bg-slate-100 hover:scale-[1.02]",

        ghost:
          "hover:bg-slate-100 hover:scale-[1.02]",
      },

      size: {
        default: "h-11 px-6",

        sm: "h-9 px-4",

        lg: "h-14 px-8 text-base",

        icon: "h-10 w-10",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

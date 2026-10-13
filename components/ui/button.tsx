import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center overflow-hidden rounded-xl text-sm font-semibold transition-all duration-300 ease-out disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-orange-600",
  {
    variants: {
variant: {
        default:
          "bg-gradient-to-b from-brand-orange-500 to-brand-orange-700 text-white shadow-[0_12px_30px_-10px_rgba(244,123,32,0.65)] hover:from-brand-orange-500 hover:to-brand-orange-800 hover:shadow-[0_16px_38px_-10px_rgba(244,123,32,0.75)] hover:scale-[1.02]",

        secondary:
          "bg-gradient-to-b from-brand-blue-700 to-brand-blue-950 text-white shadow-[0_12px_30px_-12px_rgba(26,58,156,0.6)] hover:from-brand-blue-700 hover:to-brand-blue-950 hover:scale-[1.02]",

        outline:
          "border border-slate-300 bg-white text-slate-800 hover:border-brand-orange-300 hover:bg-brand-orange-50 hover:text-brand-orange-800 hover:shadow-[0_10px_24px_-12px_rgba(244,123,32,0.4)] hover:scale-[1.02]",

        "outline-white":
          "border-2 border-white/70 bg-white/0 text-white backdrop-blur-sm hover:border-white hover:bg-white/10 hover:scale-[1.02]",

        ghost:
          "text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:scale-[1.02]",
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
  children,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
return (
    <ButtonPrimitive
      data-slot="button"
      className={cn("group", buttonVariants({ variant, size, className }))}
      {...props}
    >
      {variant === "default" || variant === "secondary" ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
        />
      ) : null}
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
      </span>
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }

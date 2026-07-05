import * as React from "react"
import { cn } from '../../lib/utils';

const Button = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
        variant?: "default" | "outline" | "ghost" | "danger" | "success"
        size?: "default" | "sm" | "lg" | "icon"
    }
>(({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
        <button
            ref={ref}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                {
                    "bg-primary text-primary-foreground hover:bg-primary/90": variant === "default",
                    "border border-white/10 bg-surface/50 hover:bg-surface/80 text-foreground": variant === "outline",
                    "hover:bg-surface/50 text-foreground": variant === "ghost",
                    "bg-danger text-white hover:bg-danger/90": variant === "danger",
                    "bg-success text-white hover:bg-success/90": variant === "success",
                    "h-10 px-4 py-2": size === "default",
                    "h-9 rounded-md px-3": size === "sm",
                    "h-11 rounded-md px-8": size === "lg",
                    "h-10 w-10": size === "icon",
                },
                className
            )}
            {...props}
        />
    )
})
Button.displayName = "Button"

export { Button }

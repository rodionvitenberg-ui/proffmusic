"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { motion, useInView } from "framer-motion"
import { cn } from "@/lib/utils"

interface LabelProps extends React.ComponentProps<typeof LabelPrimitive.Root> {
  direction?: "left" | "right" | "top" | "bottom"
  disableAnimation?: boolean
}

function mergeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => {
      if (!ref) return
      if (typeof ref === "function") ref(value)
      else (ref as React.MutableRefObject<T | null>).current = value
    })
  }
}

const MotionLabel = React.forwardRef<
  HTMLLabelElement,
  LabelProps & { children?: React.ReactNode }
>(({ direction = "left", disableAnimation, className, asChild, ...props }, ref) => {
  const localRef = React.useRef<HTMLLabelElement>(null)
  const isInView = useInView(localRef, { once: false, margin: "-50px" })

  const variants = {
    left: { initial: { x: -20 }, animate: { x: 0 } },
    right: { initial: { x: 20 }, animate: { x: 0 } },
    top: { initial: { y: -20 }, animate: { y: 0 } },
    bottom: { initial: { y: 20 }, animate: { y: 0 } },
  }

  const baseClasses = cn(
    "flex items-center gap-2 text-sm leading-none font-medium select-none user-select-none",
    "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-70",
    "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
    className
  )

  if (disableAnimation) {
    return (
      <LabelPrimitive.Root 
        ref={mergeRefs(ref, localRef)} 
        className={baseClasses} 
        asChild={asChild}
        {...props} 
      />
    )
  }

  return (
    <motion.label
      ref={mergeRefs(ref, localRef)}
      className={baseClasses}
      initial={variants[direction].initial}
      animate={isInView ? variants[direction].animate : variants[direction].initial}
      transition={{ duration: 0.5 }}
      // ВАЖНО: Кастуем props к any, чтобы TypeScript не ругался на несовпадение onDrag
      {...(props as any)}
    />
  )
})
MotionLabel.displayName = LabelPrimitive.Root.displayName

const Label = MotionLabel

export { Label }
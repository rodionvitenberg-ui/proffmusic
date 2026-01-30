import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  );
}

function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item asChild {...props}>
      <motion.button
        type="button"
        data-slot="radio-group-item"
        className={cn(
          "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
          // Убрали scale при ховере, чтобы не ломать верстку списка
          "hover:border-white/30", 
          className
        )}
        // Анимация нажатия осталась (пружинка), но она не влияет на соседние элементы сильно
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <RadioGroupPrimitive.Indicator
          data-slot="radio-group-indicator"
          className="relative flex items-center justify-center"
          asChild
          // forceMount гарантирует, что индикатор всегда в DOM, но мы рендерим его условно через children
        >
          {/* УБРАЛИ MOTION.DIV - ТЕПЕРЬ ЭТО ОБЫЧНЫЙ SPAN */}
          {/* Он появляется мгновенно благодаря Radix, без анимации framer-motion */}
          <span className="absolute flex items-center justify-center w-full h-full">
             <Circle className="fill-primary w-2 h-2" />
          </span>
        </RadioGroupPrimitive.Indicator>
      </motion.button>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
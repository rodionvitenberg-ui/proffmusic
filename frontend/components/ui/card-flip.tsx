"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function CardFlip({
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  children: [React.ReactNode, React.ReactNode];
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [front, back] = React.Children.toArray(children);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className={cn("relative w-full h-full cursor-pointer", className)}
      style={{ perspective: "1000px" }}
      onClick={handleFlip} // Клик переворачивает карточку
      {...props}
    >
      <motion.div
        className="relative w-full h-full"
        initial={false}
        animate={{ rotateY: isFlipped ? -180 : 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* ЛИЦЕВАЯ СТОРОНА */}
        <div 
          className="w-full h-full" 
          style={{ 
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transformStyle: "preserve-3d"
          }}
        >
          {front}
        </div>

        {/* ОБРАТНАЯ СТОРОНА */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(-180deg)",
            transformStyle: "preserve-3d"
          }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
}

function CardFlipFront({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-[#181818] border border-white/5 flex flex-col gap-4 rounded-xl p-4 shadow-sm h-full hover:border-white/20 transition-colors",
        className
      )}
      {...props}
    />
  );
}

function CardFlipBack({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-[#202020] border border-white/10 flex flex-col gap-4 rounded-xl p-4 shadow-sm h-full overflow-y-auto custom-scrollbar",
        className
      )}
      {...props}
    />
  );
}

// Экспортируем только то, что нужно
export {
  CardFlip,
  CardFlipFront,
  CardFlipBack,
};
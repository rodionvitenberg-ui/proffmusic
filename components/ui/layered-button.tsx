"use client";
import React, { useEffect, useRef } from 'react';
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Убрали любые active:scale или hover:scale, если они были в глобальных стилях
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 overflow-hidden box-border [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow",
        outline: "border border-input bg-transparent shadow-sm",
      },
      size: {
        default: "h-10 px-6 py-2", // Чуть увеличили дефолтный размер
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface LayeredButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  borderWidth?: number;
  asChild?: boolean;
  as?: React.ElementType; // Добавляем возможность менять тег (например, на span)
}

const LayeredButton = React.forwardRef<HTMLButtonElement, LayeredButtonProps>(
  ({
    className,
    variant,
    size,
    children,
    borderWidth = 0.5,
    asChild = false,
    as: Tag = "button", // По умолчанию button
    ...props
  }, ref) => {
    const internalRef = useRef<HTMLButtonElement>(null);
    const circleRef = useRef<HTMLSpanElement>(null);
    const labelRef = useRef<HTMLSpanElement>(null);
    const hoverLabelRef = useRef<HTMLSpanElement>(null);

    // Если asChild true, мы обязаны использовать Slot. 
    // Если asChild false, используем переданный Tag (button, span, div).
    const Comp = asChild ? Slot : Tag;

    React.useImperativeHandle(ref, () => internalRef.current!);

    useEffect(() => {
      const button = internalRef.current;
      const circle = circleRef.current;
      const label = labelRef.current;
      const hoverLabel = hoverLabelRef.current;

      if (!button || !circle) return;

      const layout = () => {
        const rect = button.getBoundingClientRect();
        const { width: w, height: h } = rect;
       
        // Логика круга (анимация заливки)
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;
        circle.style.left = '50%';
        circle.style.transform = 'translateX(-50%) scale(0)';
        circle.style.transformOrigin = `50% ${originY}px`;

        if (label) label.style.transform = 'translateY(0)';
        if (hoverLabel) {
          hoverLabel.style.transform = `translateY(${h + 12}px)`;
          hoverLabel.style.opacity = '0';
        }

        circle.dataset.scale = '1.2';
        if (label) label.dataset.moveY = (-(h + 8)).toString();
        if (hoverLabel) hoverLabel.dataset.startY = Math.ceil(h + 100).toString();
      };

      requestAnimationFrame(layout);
      const onResize = () => layout();
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }, [children, size, variant]);

    const handleMouseEnter = () => {
      const circle = circleRef.current;
      const label = labelRef.current;
      const hoverLabel = hoverLabelRef.current;

      if (circle) {
        circle.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)';
        circle.style.transform = `translateX(-50%) scale(${circle.dataset.scale || 1.2})`;
      }
      if (label) {
        label.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)';
        label.style.transform = `translateY(${label.dataset.moveY || -50}px)`;
      }
      if (hoverLabel) {
        hoverLabel.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.4s';
        hoverLabel.style.transform = 'translateY(0)';
        hoverLabel.style.opacity = '1';
      }
    };

    const handleMouseLeave = () => {
      const circle = circleRef.current;
      const label = labelRef.current;
      const hoverLabel = hoverLabelRef.current;

      if (circle) {
        circle.style.transition = 'transform 0.3s';
        circle.style.transform = 'translateX(-50%) scale(0)';
      }
      if (label) {
        label.style.transition = 'transform 0.3s';
        label.style.transform = 'translateY(0)';
      }
      if (hoverLabel) {
        hoverLabel.style.transition = 'transform 0.3s, opacity 0.3s';
        hoverLabel.style.transform = `translateY(${hoverLabel.dataset.startY || 100}px)`;
        hoverLabel.style.opacity = '0';
      }
    };

    return (
      // @ts-ignore
      <Comp
        ref={internalRef}
        className={cn(buttonVariants({ variant, size }), "rounded-md !p-0", className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <span
          className="absolute inset-0 rounded-[inherit] pointer-events-none"
          style={{ padding: borderWidth }}
        >
          <span className="block w-full h-full rounded-[inherit] bg-secondary" />
        </span>
        <span
          ref={circleRef}
          className="absolute rounded-full pointer-events-none will-change-transform bg-white/90"
        />
        <span className="relative inline-flex items-center justify-center gap-2 z-[2] px-4 py-2 w-full h-full">
          <span
            ref={labelRef}
            className="inline-flex items-center justify-center gap-2 relative z-[2] text-white/95"
            style={{ willChange: 'transform' }}
          >
            {children}
          </span>
          <span
            ref={hoverLabelRef}
            className="inline-flex items-center justify-center gap-2 absolute left-0 top-0 z-[3] whitespace-nowrap text-primary-foreground px-4 py-2 w-full h-full"
            style={{ willChange: 'transform, opacity' }}
          >
            {children}
          </span>
        </span>
      </Comp>
    );
  }
);

LayeredButton.displayName = "LayeredButton";

export { LayeredButton, buttonVariants };
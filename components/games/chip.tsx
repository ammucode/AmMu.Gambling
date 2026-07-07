import { cn } from '@/lib/utils';
import React from 'react';

export interface ChipProps extends React.ComponentProps<'div'> {
  value: number;
  hideOnZero?: boolean;
  highlight?: boolean;
  size?: number;
  dynamicSizing?: boolean | "lg";
  dynamicTextSizing?: boolean;
}
export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  (
    {
      value,
      hideOnZero,
      highlight,
      size,
      dynamicSizing,
      dynamicTextSizing,
      className,
      ...restDivProps
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'grid aspect-square min-w-0 place-items-center rounded-full bg-white mask-circle text-black',
          false ? ""
            : dynamicSizing === "lg" ? "h-4 @lg:h-6 @2xl:h-8 @3xl:h-10 @4xl:h-12"
            : dynamicSizing ? 'h-3 @lg:h-4 @2xl:h-6 @3xl:h-8 @4xl:h-10 @5xl:h-12'
            : 'h-12',
          false ? ""
            : dynamicSizing === "lg" ? 'text-xs @lg:text-sm @3xl:text-lg'
            : (dynamicTextSizing ?? dynamicSizing) ? 'text-[8px] @lg:text-xs @3xl:text-sm @4xl:text-lg'
            : 'text-lg',
          size && `h-${size}`,
          highlight && 'shadow-[0px_0px_64px_10px_rgba(255,221,0,1)]',
          hideOnZero && value === 0 && 'invisible',
          className
        )}
        {...restDivProps}
      >
        ${value}
      </div>
    );
  }
);

Chip.displayName = 'Chip';

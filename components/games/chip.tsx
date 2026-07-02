import { cn } from '@/lib/utils';

export interface ChipProps {
  value: number;
  highlight?: boolean;
  size?: number;
  className?: string;
}
export function Chip({ value, highlight, size, className }: ChipProps) {
  return (
    <div
      className={cn(
        'grid aspect-square place-items-center rounded-full bg-white mask-circle text-black',
        'h-3 @lg:h-4 @2xl:h-6 @3xl:h-8 @4xl:h-10 @5xl:h-12',
        'text-[8px] @lg:text-xs @3xl:text-sm @4xl:text-lg @5xl:h-12',
        size && `h-${size}`,
        highlight && 'shadow-[0px_0px_64px_10px_rgba(255,221,0,1)]',
        className
      )}
    >
      ${value}
    </div>
  );
}

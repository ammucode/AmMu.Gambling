import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('animate-pulse rounded-2xl bg-muted', className)}
      {...props}
    />
  );
}

type SkeletonOrProps = 'render'|'before'|'after';
function SkeletonOr({ render, before, after, ...props }: React.ComponentProps<'div'> & Partial<Record<SkeletonOrProps, React.ReactNode>>) {
  if (render) return (
    <>{before}{render}{after}</>
  );
  return <Skeleton {...props} />;
}

export { Skeleton, SkeletonOr };

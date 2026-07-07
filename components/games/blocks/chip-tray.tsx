import { ChipDenomination, ChipDenominations } from '@/lib/games/chips';
import { Chip } from '../chip';
import { cn, stripPrefix } from '@/lib/utils';
import { useDragDropMonitor, useDraggable, useDroppable } from '@dnd-kit/react';
import { Feedback } from '@dnd-kit/dom';

export interface ChipTrayProps {
  activeChip: ChipDenomination;
  setActiveChip: (chip: ChipDenomination) => unknown;
  className?: string;
}
export function ChipTray({
  activeChip,
  setActiveChip,
  className,
}: ChipTrayProps) {
  useDragDropMonitor({
    onDragStart(event) {
      const source = event.operation.source;
      if (!source) return;
      if (source.type !== 'chip') return;
      if (typeof source.id !== 'string') return;
      if (!source.id.startsWith('chip')) return;
      setActiveChip(
        parseInt(stripPrefix(source.id, 'chip')) as ChipDenomination
      );
    },
  });

  const chipTrayDroppable = useDroppable({ id: 'chipTray', accept: 'bet' });

  return (
    <div
      ref={chipTrayDroppable.ref}
      className={cn(
        'flex flex-row items-center justify-between gap-4 mt-5'
        // chipTrayDroppable.isDropTarget && "shadow-[0px_0px_64px_10px_rgba(255,221,0,1)]"
      )}
    >
      {ChipDenominations.map((chip) => {
        const draggable = useDraggable({
          id: `chip${chip}`,
          plugins: [
            Feedback.configure({
              // feedback: 'clone',
              // dropAnimation: {
              //   duration: 700,   // milliseconds (default: 250)
              //   easing: 'ease',  // CSS easing (default: 'ease')
              // },
              // dropAnimation: async (ctx) => {
              //   console.log(ctx);
              //   await ctx.element.animate(
              //     [{transform: `translate3d(450px, 0px, 0)`}, {transform: 'translate3d(0, 0, 0)'}],
              //     {duration: 700, easing: 'ease'}
              //   ).finished
              // }
              // dropAnimation: async ({source, element, translate}) => {
              //   return await element.animate(
              //     [{transform: `translate3d(${translate.x}px, ${translate.y}px, 0)`}, {transform: 'translate3d(0, 0, 0)'}],
              //     {duration: 200, easing: 'ease-out'}
              //   ).finished;
              //   // const targetCenter = source.manager?.dragOperation.target?.shape?.center;
              //   // const elementRect = element.getBoundingClientRect();
              //   // const sourceCenter = {
              //   //   x: elementRect.x + elementRect.width/2,
              //   //   y: elementRect.y + elementRect.height/2,
              //   // };
              //   // const translateDest = true//targetCenter
              //   // // ? `translate3d(${targetCenter.x - sourceCenter.x}px, ${targetCenter.y - sourceCenter.y}px, 0)`
              //   // ? `translate3d(20px, 20px, 0)`
              //   // : 'translate3d(0, 0, 0)';
              //   // console.log({targetCenter,sourceCenter,translateDest});
              //   // await element.animate(
              //   //   [{transform: `translate3d(${translate.x}px, ${translate.y}px, 0)`}, {transform: translateDest}],
              //   //   {duration: 200, easing: 'ease-out'}
              //   // ).finished
              // },
            }),
          ],
          type: 'chip',
        });
        return (
          <Chip
            key={chip}
            value={chip}
            highlight={activeChip === chip}
            dynamicSizing="lg"
            className={cn(
              'transition-all duration-100 ease-in-out hover:scale-125',
              className,
              activeChip === chip && "-translate-y-4",
            )}
            ref={draggable.ref}
            onClick={() => setActiveChip(chip)}
          />
        );
      })}
    </div>
  );
}

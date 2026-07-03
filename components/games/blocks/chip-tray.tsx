import { ChipDenomination, ChipDenominations } from '@/lib/games/chips';
import { Chip } from '../chip';
import { cn } from '@/lib/utils';
import { useDragDropMonitor, useDraggable, useDroppable } from '@dnd-kit/react';
import { Feedback } from '@dnd-kit/dom';

export interface ChipTrayProps {
  activeChip: ChipDenomination;
  setActiveChip: (chip: ChipDenomination) => unknown;
  className?: string;
}
export function ChipTray({ activeChip, setActiveChip, className }: ChipTrayProps) {
  useDragDropMonitor({
    onDragStart(event) {
      const source = event.operation.source;
      if (!source) return;
      if (source.type !== "chip") return;
      if (typeof source.id !== "string") return;
      if (!source.id.startsWith("chip")) return;
      setActiveChip(parseInt(source.id.substring(4)) as ChipDenomination);
    }
  });

  const chipTrayDroppable = useDroppable({id: "chipTray", accept: "bet"});

  return (
    <div ref={chipTrayDroppable.ref} className={cn(
      "flex flex-row items-center justify-between gap-4",
      // chipTrayDroppable.isDropTarget && "shadow-[0px_0px_64px_10px_rgba(255,221,0,1)]"
    )}>
      {ChipDenominations.map((chip) => {
        const draggable = useDraggable({
          id: `chip${chip}`,
          plugins: [
            Feedback.configure({
              feedback: 'clone',
            }),
          ],
          type: "chip",
        });
        return (
          <Chip
            key={chip}
            value={chip}
            highlight={activeChip === chip}
            className={cn("hover:scale-125 transition-all duration-100 ease-in-out", className)}
            ref={draggable.ref}
            onClick={() => setActiveChip(chip)}
          />
        );
      })}
    </div>
  );
}

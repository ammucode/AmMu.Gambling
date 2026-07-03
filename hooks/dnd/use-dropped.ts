import { Draggable, Droppable } from '@dnd-kit/dom';
import { useDragDropMonitor } from '@dnd-kit/react';
import { DragOperation, Type, UniqueIdentifier } from '@dnd-kit/abstract';
import { ExtendsStrict, If, SetRequired } from 'type-fest';

type DropOperation<
  T extends Record<string, unknown>,
  Source extends Draggable<T>,
  Target extends Droppable<T>,
> = SetRequired<DragOperation<Source, Target>, 'source' | 'target'>;

type SourceFilter<
  SourceType extends Type,
  SourcePrefix extends UniqueIdentifier,
> = unknown &
  If<
    ExtendsStrict<Type, SourceType>,
    unknown,
    SourceType extends string
      ? If<ExtendsStrict<string, SourceType>, unknown, { type: SourceType }>
      : SourceType extends number
        ? If<ExtendsStrict<number, SourceType>, unknown, { type: SourceType }>
        : SourceType extends symbol
          ? If<ExtendsStrict<symbol, SourceType>, unknown, { type: SourceType }>
          : unknown
  > &
  If<
    ExtendsStrict<UniqueIdentifier, SourcePrefix>,
    unknown,
    SourcePrefix extends string
      ? If<
          ExtendsStrict<string, SourcePrefix>,
          unknown,
          { id: `${SourcePrefix}${string}` }
        >
      : SourcePrefix extends number
        ? If<ExtendsStrict<number, SourcePrefix>, unknown, { id: SourcePrefix }>
        : unknown
  >;

export function useDropped<
  T extends Record<string, unknown>,
  Source extends Draggable<T>,
  Target extends Droppable<T>,
  SourceType extends Type,
  TargetType extends Type,
  SourcePrefix extends UniqueIdentifier,
>(
  onDrop: (
    source: Source & NoInfer<SourceFilter<SourceType, SourcePrefix>>,
    target: Target,
    operation: DropOperation<T, Source, Target>
  ) => unknown,
  {
    sourceType,
    targetType,
    sourceIdPrefix,
    targetId,
  }: {
    sourceType?: SourceType;
    targetType?: TargetType;
    sourceIdPrefix?: SourcePrefix;
    targetId?: UniqueIdentifier;
  }
) {
  useDragDropMonitor<T, Source, Target>({
    onDragEnd(event) {
      if (event.canceled) return;
      const { source, target } = event.operation;
      if (!source || !target) return;
      if (sourceType !== undefined && source.type !== sourceType) return;
      if (targetType !== undefined && target.type !== targetType) return;
      if (
        sourceIdPrefix !== undefined &&
        (typeof source.id === 'string'
          ? !source.id.startsWith(`${sourceIdPrefix}`)
          : source.id === sourceIdPrefix)
      )
        return;
      if (targetId !== undefined && target.id !== targetId) return;
      onDrop(
        source as Source & NoInfer<SourceFilter<SourceType, SourcePrefix>>,
        target,
        event.operation as DropOperation<T, Source, Target>
      );
    },
  });
}

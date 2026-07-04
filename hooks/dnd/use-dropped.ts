import { Draggable, Droppable } from '@dnd-kit/dom';
import { useDragDropMonitor } from '@dnd-kit/react';
import { DragOperation, Type, UniqueIdentifier } from '@dnd-kit/abstract';
import { ExtendsStrict, If, SetRequired } from 'type-fest';

type DropOperation<
  T extends Record<string, unknown>,
  Source extends Draggable<T>,
  Target extends Droppable<T>,
> = SetRequired<DragOperation<Source, Target>, 'source' | 'target'>;

type DragDropFilter<
  DragDropType extends Type,
  IdPrefix extends UniqueIdentifier,
> = unknown &
  If<
    ExtendsStrict<Type, DragDropType>,
    unknown,
    DragDropType extends string
      ? If<ExtendsStrict<string, DragDropType>, unknown, { type: DragDropType }>
      : DragDropType extends number
        ? If<ExtendsStrict<number, DragDropType>, unknown, { type: DragDropType }>
        : DragDropType extends symbol
          ? If<ExtendsStrict<symbol, DragDropType>, unknown, { type: DragDropType }>
          : unknown
  > &
  If<
    ExtendsStrict<UniqueIdentifier, IdPrefix>,
    unknown,
    IdPrefix extends string
      ? If<
          ExtendsStrict<string, IdPrefix>,
          unknown,
          { id: `${IdPrefix}${string}` }
        >
      : IdPrefix extends number
        ? If<ExtendsStrict<number, IdPrefix>, unknown, { id: IdPrefix }>
        : unknown
  >;

export function useDropped<
  T extends Record<string, unknown>,
  Source extends Draggable<T>,
  Target extends Droppable<T>,
  SourceType extends Type,
  TargetType extends Type,
  SourcePrefix extends UniqueIdentifier,
  TargetPrefix extends UniqueIdentifier,
>(
  onDrop: (ctx:{
    source: Source & NoInfer<DragDropFilter<SourceType, SourcePrefix>>,
    target: Target & NoInfer<DragDropFilter<TargetType, TargetPrefix>>,
    operation: DropOperation<T, Source, Target>
  }) => unknown,
  {
    sourceType,
    targetType,
    sourceId,
    targetId,
    sourceIdPrefix,
    targetIdPrefix,
  }: {
    sourceType?: SourceType;
    targetType?: TargetType;
    sourceId?: UniqueIdentifier;
    targetId?: UniqueIdentifier;
    sourceIdPrefix?: SourcePrefix;
    targetIdPrefix?: TargetPrefix;
  }
) {
  useDragDropMonitor<T, Source, Target>({
    onDragEnd(event) {
      if (event.canceled) return;
      const { source, target } = event.operation;
      if (!source || !target) return;
      if (sourceType !== undefined && source.type !== sourceType) return;
      if (targetType !== undefined && target.type !== targetType) return;
      if (sourceId !== undefined && source.id !== sourceId) return;
      if (targetId !== undefined && target.id !== targetId) return;
      if (
        sourceIdPrefix !== undefined &&
        (typeof source.id === 'string'
          ? !source.id.startsWith(`${sourceIdPrefix}`)
          : source.id === sourceIdPrefix)
      )
        return;
      if (
        targetIdPrefix !== undefined &&
        (typeof target.id === 'string'
          ? !target.id.startsWith(`${targetIdPrefix}`)
          : target.id === targetIdPrefix)
      )
        return;
      onDrop({
        source: source as Source & NoInfer<DragDropFilter<SourceType, SourcePrefix>>,
        target: target as Target & NoInfer<DragDropFilter<TargetType, TargetPrefix>>,
        operation: event.operation as DropOperation<T, Source, Target>
      });
    },
  });
}

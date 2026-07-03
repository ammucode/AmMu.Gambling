"use client";

import { GameProps } from '@/lib/games/client';
import { DragDropProvider, useDraggable, useDroppable } from '@dnd-kit/react';
import React, { useState } from 'react';

function Draggable() {
  const {ref} = useDraggable({
    id: 'draggable',
  });

  return (
    <button ref={ref} className="bg-blue-500">
      Draggable
    </button>
  );
}
function Droppable({id, children}: {id:string; children: React.ReactNode}) {
  const {ref} = useDroppable({
    id,
  });

  return (
    <div ref={ref} style={{width: 300, height: 300, backgroundColor:"red"}}>
      {children}
    </div>
  );
}
export function VideoPoker({}: GameProps) {
  const [isDropped, setIsDropped] = useState(false);
  return (
    <>
      <DragDropProvider
        onBeforeDragStart={(event)=>((window as any).foo = event) && console.log("onBeforeDragStart", event)}
        onCollision={(event)=>console.log("onCollision", event)}
        onDragStart={(event)=>console.log("onDragStart", event)}
        onDragMove={(event)=>console.log("onDragMove", event)}
        onDragOver={(event)=>console.log("onDragOver", event)}
      onDragEnd={(event) => {
        console.log("onDragEnd", event);
        if (event.canceled) return;

        const {target} = event.operation;
        setIsDropped(target?.id === 'droppable');
      }}
    >
      {!isDropped && <Draggable />}

      <Droppable id="droppable">
        {isDropped && <Draggable />}
      </Droppable>
    </DragDropProvider>
    </>
  );
}

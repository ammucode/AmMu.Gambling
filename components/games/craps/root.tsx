'use client';

import { RootGameProps } from '../types';

export function Craps({ subGame, children }: RootGameProps) {
  return (
    <div className="@container flex h-full w-full flex-col items-center gap-6 rounded-lg bg-green-900 p-4">
      <h1 className="text-[3.5rem] font-extrabold text-yellow-600 italic drop-shadow-amber-500">
        {subGame.title}
      </h1>
      <div className="relative m-2 mt-0 grid h-full w-full resize place-items-center">
        {children}
      </div>
    </div>
  );
}

"use client";

import { GameProps, RootGameProps } from '../types';

export function Craps({ game, subGame, children }: RootGameProps) {
  return (
    <div className='bg-green-900 w-full h-full rounded-lg p-4 flex flex-col items-center gap-6'>
      <h1 className='text-[3.5rem] font-extrabold italic text-yellow-600 drop-shadow-amber-500'>{subGame.title}</h1>
      <div className='w-full h-full p-2 pt-0'>
        {children}
      </div>
    </div>
  );
}

import { GamePath, getGameByPath } from '@/lib/games/games';
import { usePathname } from 'next/navigation';

export function useGamePath(): GamePath {
  const path = usePathname();
  if (!path.startsWith('/games/'))
    throw new Error(`useGamePath must be called from a /games route!`);
  const gamePath = path.split('/').slice(2);
  const gamePair = getGameByPath(gamePath);
  if (!gamePair)
    throw new Error(`useGamePath must be called from a /games route!`);
  return gamePath as GamePath;
}

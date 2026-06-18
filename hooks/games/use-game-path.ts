import { GamePath, getGameByPath } from '@/lib/games/games';
import { usePathname } from 'next/navigation';

export function useGamePath(): GamePath {
  const pathname = usePathname();
  if (!pathname.startsWith('/games/'))
    throw new Error(`useGamePath must be called from a /games route!`);
  const path = pathname.split('/').slice(2);
  const gamePair = getGameByPath(path);
  if (!gamePair)
    throw new Error(`useGamePath must be called from a /games route!`);
  return path as GamePath;
}

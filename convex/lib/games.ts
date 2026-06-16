import { GamePath, GamePathString } from '@/lib/games/games';
import { userPrivateInfo } from '../shared/models';

export function makeGameSlug(user: userPrivateInfo, gamePath: GamePath) {
  return `${user.username}-._.-${gamePath.join('/') as GamePathString}` as const;
}

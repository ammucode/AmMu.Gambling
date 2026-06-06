import { EasyCraps } from '@/components/games/craps/easy/root';
import { Craps } from '@/components/games/craps/root';
import { VideoPoker } from '@/components/games/poker/video/root';
import {
  GameComponent,
  RootGameComponent,
  SubGameComponent,
} from '@/components/games/types';
import { Dices, LucideIcon, LucideProps, Spade } from 'lucide-react';
import { Simplify } from '../types';

export interface BaseGame {
  title: string;
  path: string;
  icon?:
    | LucideIcon
    | (LucideProps & {
        lucideIcon: LucideIcon;
      });
  // isActive: boolean;
}
export interface RootGame extends Required<BaseGame> {
  component: GameComponent;
  rootComponent?: never;
  subGames?: never;
}
export interface SubGame extends BaseGame {
  component: SubGameComponent;
}
export interface RootGameWithSubs extends Required<BaseGame> {
  // isActive: false;
  component?: never;
  rootComponent?: RootGameComponent;
  subGames: SubGame[];
}
export type Game = RootGame | RootGameWithSubs;
export const GAMES = [
  {
    title: 'Craps',
    path: 'craps',
    icon: Dices,
    // isActive: false,
    rootComponent: Craps,
    subGames: [
      {
        title: 'Easy Craps',
        path: 'easy',
        // isActive: false as boolean,
        component: EasyCraps,
      },
    ],
  },
  {
    title: 'Video Poker',
    path: 'video-poker',
    icon: Spade,
    // isActive: false,
    component: VideoPoker,
  },
] as const satisfies Game[];

type serverOnlyFields = Simplify<
  Partial<Pick<BaseGame, 'icon'> & Pick<Game, 'component' | 'rootComponent'>>
>;

type RootContainingSubServerFields = { subGames?: serverOnlyFields[] };
type GameServerFields = Simplify<
  serverOnlyFields & RootContainingSubServerFields
>;

export type clientifyGame<G extends GameServerFields> = Simplify<
  Omit<G, keyof GameServerFields> &
    (G extends Required<RootContainingSubServerFields>
      ? {
          subGames: Simplify<
            Omit<G['subGames'][number], keyof serverOnlyFields>[]
          >;
        }
      : object)
>;
export type clientifyGameList<T extends (GameServerFields | undefined)[]> = {
  [E in keyof T]: T[E] extends undefined
    ? undefined
    : clientifyGame<Exclude<T[E], undefined>>;
};
export function clientifyGame<G extends GameServerFields>(
  game: G
): clientifyGame<G> {
  const { icon, component, rootComponent, subGames, ...result } = game;
  if (!subGames) return result as clientifyGame<G>;
  const clientSubs = subGames.map((sub) => {
    const { icon, component, rootComponent, ...subRes } = sub;
    return subRes;
  });
  return {
    result,
    subGames: clientSubs,
  } as unknown as clientifyGame<G>;
}

export function getGameByPath(path: string[]) {
  if (path.length < 1 || path.length > 2) return undefined;
  const rootGame = GAMES.find((game) => game.path === path[0]);
  // console.log(rootGame)
  if (!rootGame) return undefined;
  if (!('subGames' in rootGame))
    return [rootGame, undefined] as [RootGame, undefined];
  const subGame = rootGame.subGames.find((game) => game.path === path[1]);
  // console.log(subGame);
  if (!subGame) return undefined;
  return [rootGame, subGame] as [RootGameWithSubs, SubGame];
}

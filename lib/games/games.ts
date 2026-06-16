import { EasyCraps } from '@/components/games/craps/easy/root';
import { Craps } from '@/components/games/craps/root';
import { VideoPoker } from '@/components/games/poker/video/root';
import {
  GameComponent,
  RootGameComponent,
  SubGameComponent,
} from '@/components/games/types';
import { Dices, LucideIcon, LucideProps, Spade } from 'lucide-react';
import { FlattenOnce, Join, Simplify } from '../types';

export interface BaseGame {
  title: string;
  path: string;
  icon?:
    | LucideIcon
    | (LucideProps & {
        lucideIcon: LucideIcon;
      });
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
    rootComponent: Craps,
    subGames: [
      {
        title: 'Easy Craps',
        path: 'easy',
        component: EasyCraps,
      },
    ],
  },
  {
    title: 'Video Poker',
    path: 'video-poker',
    icon: Spade,
    component: VideoPoker,
  },
] as const satisfies Game[];
type GAMES = typeof GAMES;

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

type subGamePaths<Path extends string, Gs extends SubGame[]> = {
  [K in keyof Gs]: [Path, Gs[K]['path']];
};
type gamePaths<G extends Game> = G extends RootGameWithSubs
  ? subGamePaths<G['path'], G['subGames']>
  : [[G['path']]];
function gamePaths<G extends Game>(game: G): gamePaths<G> {
  return (
    'subGames' in game && game.subGames
      ? game.subGames.map((sub) => [game.path, sub.path])
      : [[game.path]]
  ) as gamePaths<G>;
}
type allGamePaths<Gs extends Game[] = GAMES> = {
  [K in keyof Gs]: gamePaths<Gs[K]>;
};

export const GAME_PATHS = GAMES.flatMap(
  (game) => gamePaths(game) as unknown
) as unknown as FlattenOnce<allGamePaths<GAMES>>;
export type GAME_PATHS = typeof GAME_PATHS;
export type GamePath = GAME_PATHS[keyof GAME_PATHS & number];
export type GamePathString = Join<GamePath, '/'>;

export type GamePair = [RootGame, undefined] | [RootGameWithSubs, SubGame];
export function getGameByPath(path: GamePath): GamePair;
export function getGameByPath(path: string[]): GamePair | undefined;
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

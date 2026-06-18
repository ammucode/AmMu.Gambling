import { EasyCraps } from '@/components/games/craps/easy/root';
import { Craps } from '@/components/games/craps/root';
import { VideoPoker } from '@/components/games/poker/video/root';
import {
  GameComponent,
  RootGameComponent,
  SubGameComponent,
} from '@/components/games/types';
import { Dices, LucideIcon, LucideProps, Spade } from 'lucide-react';
import { FlattenOnce, ZipObject } from '../types';
import { Join, SimplifyDeep } from 'type-fest';
import z from 'zod';

// --- base defs ---
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

type serverOnlyFields = SimplifyDeep<
  Partial<Pick<BaseGame, 'icon'> & Pick<Game, 'component' | 'rootComponent'>>
>;

type RootContainingSubServerFields = { subGames?: serverOnlyFields[] };
type GameServerFields = SimplifyDeep<
  serverOnlyFields & RootContainingSubServerFields
>;
// END --- base defs ---


// --- clientify ---
export type clientifyGame<G extends GameServerFields> = SimplifyDeep<
  Omit<G, keyof GameServerFields> &
    (G extends Required<RootContainingSubServerFields>
      ? {
          subGames: SimplifyDeep<
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
// END --- clientify ---


// --- Flatten Games ---
type games<G extends Game> = G extends RootGameWithSubs
  ? G['subGames']
  : [G];
function games<G extends Game>(game: G): games<G> {
  return (
    'subGames' in game && game.subGames
      ? game.subGames
      : [game]
  ) as games<G>;
}
type allGames<Gs extends Game[] = GAMES> = {
  [K in keyof Gs]: games<Gs[K]>;
};

export const FLAT_GAMES = GAMES.flatMap(
  (game) => games(game) as unknown
) as unknown as FlattenOnce<allGames<GAMES>>;
export type FLAT_GAMES = typeof FLAT_GAMES;
export type FlatGame = FLAT_GAMES[number];
// END --- Flatten Games ---


// --- Flatten Game Paths ---
type subGamePaths<Path extends string, Gs extends SubGame[]> = {
  [K in keyof Gs]: [Path, Gs[K]['path']];
};
type paths<G extends Game> = G extends RootGameWithSubs
  ? subGamePaths<G['path'], G['subGames']>
  : [[G['path']]];
function paths<G extends Game>(game: G): paths<G> {
  return (
    'subGames' in game && game.subGames
      ? game.subGames.map((sub) => [game.path, sub.path])
      : [[game.path]]
  ) as paths<G>;
}
type allGamePaths<Gs extends Game[] = GAMES> = {
  [K in keyof Gs]: paths<Gs[K]>;
};

export const GAME_PATHS = GAMES.flatMap(
  (game) => paths(game) as unknown
) as unknown as FlattenOnce<allGamePaths<GAMES>>;
export type GAME_PATHS = typeof GAME_PATHS;
export type GamePath = GAME_PATHS[number];
export const GAME_PATH_SCHEMA = z.custom<GamePath>(
  (val) => getGameByPath(val as GamePath) !== undefined
);
// END --- Flatten Game Paths ---

// --- GamePathString ---
type GamePathsToStrings<GPs extends string[][]> = GPs extends []
  ? []
  : GPs extends [infer Head extends string[]]
    ? [Join<Head, '/'>]
    : GPs extends [
          infer Head extends string[],
          ...infer Tail extends string[][],
        ]
      ? [Join<Head, '/'>, ...GamePathsToStrings<Tail>]
      : never;
export const GamePathStrings = GAME_PATHS.map((path) =>
  path.join('/')
) as GamePathsToStrings<GAME_PATHS>;
export type GamePathStrings = typeof GamePathStrings;
export type GamePathString = GamePathStrings[number];


export const GamePathStringToGame = Object.fromEntries(GamePathStrings.map((path, i) => [
  path,
  FLAT_GAMES[i],
] as const)) as SimplifyDeep<ZipObject<GamePathStrings, FLAT_GAMES>>;
// END --- GamePathString ---


// --- GamePair ---
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
// END --- GamePair ---

// --- GameSlug / session key ---
export const GAME_SESSION_KEY_DELIM = '-._.-' as const;
export function makeGameSessionKey(username: string, path: GamePath) {
  return `${username}${GAME_SESSION_KEY_DELIM}${path.join('/') as GamePathString}` as const;
}
export type GameSlug = ReturnType<typeof makeGameSessionKey>;
export const GameSlugSchema = z.templateLiteral([
  z.string(),
  GAME_SESSION_KEY_DELIM,
  z.enum(GamePathStrings),
]);
export function pathFromGameSessionKey(sessionKey: GameSlug) {
  return sessionKey.split(GAME_SESSION_KEY_DELIM)[1].split('/') as GamePath;
}

export function sessionKeyForGame<PathString extends GamePathString>(sessionKey: GameSlug, path: PathString): sessionKey is `${string}${typeof GAME_SESSION_KEY_DELIM}${PathString}` {
  return sessionKey.endsWith(path);
}
// END --- GameSlug / session key ---

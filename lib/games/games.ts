import { Dices, Spade } from "lucide-react";

export interface SubGame {
  title: string;
  path: string;
  icon?: (...args: any[]) => React.ReactNode;
  isActive: boolean;
}
type RawGame = Required<SubGame> & {
  isActive: boolean;
};
type GameWithSubs = Required<SubGame> & {
  isActive: false;
  subGames: SubGame[];
};
export type Game = RawGame | GameWithSubs;
export const GAMES = [
  {
    title: "Craps",
    path: "craps",
    icon: Dices,
    isActive: false,
    subGames: [
      {
        title: "Easy Craps",
        path: "easy",
        isActive: false as boolean,
      },
    ],
  },
  {
    title: "Video Poker",
    path: "video-poker",
    icon: Spade,
    isActive: false,
  },
] as const satisfies Game[];


export function getGameByPath(path: string[]) {
  if (path.length < 1 || path.length > 2) return undefined;
  const rootGame = GAMES.find(game => game.path === path[0]);
  console.log(rootGame)
  if (!rootGame) return undefined;
  if (!('subGames' in rootGame)) return [rootGame, undefined] as const;
  const subGame = rootGame.subGames.find(game => game.path === path[1]);
  console.log(subGame);
  if (!subGame) return undefined;
  return [rootGame, subGame] as const;
}
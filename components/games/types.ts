import {
  BaseGame,
  RootGame,
  RootGameWithSubs,
  SubGame,
} from '@/lib/games/games';

export interface GameProps {
  game: RootGame | SubGame;
}

export interface RootGameProps {
  game: RootGameWithSubs;
  subGame: SubGame;
  children: React.ReactNode;
}

export type GameComponent = (props: GameProps) => React.ReactNode;
export type SubGameComponent = GameComponent;
export type RootGameComponent = (props: RootGameProps) => React.ReactNode;

import {
  clientifyGame,
  RootGame,
  RootGameWithSubs,
  SubGame,
} from '@/lib/games/games';

export interface GameProps {
  game: clientifyGame<RootGame | SubGame>;
}

export interface RootGameProps {
  game: clientifyGame<RootGameWithSubs>;
  subGame: clientifyGame<SubGame>;
  children: React.ReactNode;
}

export type GameComponent = (props: GameProps) => React.ReactNode;
export type SubGameComponent = GameComponent;
export type RootGameComponent = (props: RootGameProps) => React.ReactNode;

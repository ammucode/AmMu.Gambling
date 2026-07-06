import { Dices, Spade } from 'lucide-react';
import { EasyCraps } from '@/components/games/craps/easy/root';
import { Craps } from '@/components/games/craps/root';
import { VideoPoker } from '@/components/games/poker/video/root';

import { gameSessionInfo } from '@/convex/shared/models';
import {
  GamePath,
  RootGame,
  RootGameWithSubs,
  SubGame,
  RootGameComponentPlaceholder,
  GAMES,
  Game,
  GameComponentPlaceholder,
  SubGameComponentPlaceholder,
  GamePathString,
} from '@/lib/games';
import { AnyFieldValueOf, PickByKeyDeep, ReplaceTypeDeep } from '../types';
import { Optional, PickDeep, Simplify } from 'type-fest';
import { LucideIcon, LucideProps } from 'lucide-react';


export interface GameProps {
  game: RootGame | SubGame;
  fullPath: GamePath;
  gameSession: gameSessionInfo,
}

export interface RootGameProps {
  game: RootGameWithSubs;
  subGame: SubGame;
  children: React.ReactNode;
}

export type GameComponent = (props: GameProps) => React.ReactNode;
export type SubGameComponent = GameComponent;
export type RootGameComponent = (props: RootGameProps) => React.ReactNode;
type aGameComponent = RootGameComponent|SubGameComponent|GameComponent;
type CompForAGameComponent<Comp extends aGameComponent> = Parameters<Comp>[0]['game'] extends RootGameWithSubs ? Optional<Comp> : Comp;

export type GameIcon = | LucideIcon
    | (LucideProps & {
        lucideIcon: LucideIcon;
      });
type GameCompWithIcon<Comp extends aGameComponent> = {
  component: CompForAGameComponent<Comp>;
  icon?: GameIcon;
};
function withIcon<Comp extends aGameComponent, Icon extends LucideIcon>(component: Comp, icon?: Icon) {
  return { component, icon } as const;
}


type GameComponentsDef = {
  [Path in GamePathString]: Path extends `${string}/${string}` ? [GameCompWithIcon<RootGameComponent>,GameCompWithIcon<SubGameComponent>] : [GameCompWithIcon<GameComponent>,undefined];
}
export const GameComponentDefs = {
  'craps/easy': [withIcon(Craps, Dices), withIcon(EasyCraps)],
  'video-poker': [withIcon(VideoPoker, Spade),undefined],
} as const satisfies GameComponentsDef;
export type GameComponentDefs = typeof GameComponentDefs;
export type GameComponentDef = Exclude<GameComponentDefs[keyof GameComponentDefs][number], undefined>;

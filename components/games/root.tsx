import {
  clientifyGame,
  GamePair,
  GamePath,
  RootGame,
  SubGame,
} from '@/lib/games/games';

export interface GameWrapperProps {
  games: GamePair;
  fullPath: GamePath;
}
export function GameRoot({ games, fullPath }: GameWrapperProps) {
  const [rootGame, subGame] = games;
  const game = (subGame ? subGame : rootGame) as SubGame | RootGame;

  const renderedGame = (
    <game.component game={clientifyGame(game)} fullPath={fullPath} />
  );

  if (subGame && rootGame.rootComponent) {
    return (
      <rootGame.rootComponent
        game={clientifyGame(rootGame)}
        subGame={clientifyGame(subGame)}
      >
        {renderedGame}
      </rootGame.rootComponent>
    );
  }

  return renderedGame;
}

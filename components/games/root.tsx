import { clientifyGame, GamePair, RootGame, SubGame } from '@/lib/games/games';

export interface GameWrapperProps {
  games: GamePair;
}
export function GameRoot({ games }: GameWrapperProps) {
  const [rootGame, subGame] = games;
  const game = (subGame ? subGame : rootGame) as SubGame | RootGame;

  const renderedGame = <game.component game={clientifyGame(game)} />;

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

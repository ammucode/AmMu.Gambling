import { GameProps, RootGameProps } from '../types';

export function Craps({ game, children }: RootGameProps) {
  return (
    <>
      <div>
        <h1>{game.title}</h1>
        {children}
      </div>
    </>
  );
}

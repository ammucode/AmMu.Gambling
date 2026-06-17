import { useGamePath } from "./use-game-path";
import { useGameSession } from "./use-game-session";

export function useGameBalance() {
  const gamePath = useGamePath();
  const gameInfo = useGameSession(gamePath);

  

  return {

  };
}
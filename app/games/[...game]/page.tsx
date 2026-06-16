import { NoAccountBlock } from '@/components/blocks/auth/no-account';
import { BalanceManager } from '@/components/games/balance-manager';
import { GameRoot } from '@/components/games/root';
import { caller } from '@/lib/convex/rsc';
import { GamePath, getGameByPath } from '@/lib/games/games';
import { notFound } from 'next/navigation';

export default async function Page({ params }: PageProps<'/games/[...game]'>) {
  const { game: gamePath } = await params;

  const games = getGameByPath(gamePath);
  if (!games) {
    notFound();
  }
  const verifiedPath = gamePath as GamePath;

  const user = await caller.users.me();

  if (!user) {
    return (
      <div className="flex h-max w-full flex-col items-center">
        <NoAccountBlock />
      </div>
    );
  }

  const session = await caller.games.control.getOrStartSession({
    gamePath: verifiedPath,
  });

  return (
    <div className="relative flex h-full w-full flex-col items-center">
      <BalanceManager session={session} />
      <GameRoot games={games} fullPath={verifiedPath} />;
    </div>
  );
}

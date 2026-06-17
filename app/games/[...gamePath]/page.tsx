import { GameRoot } from '@/components/games/root';
import { caller, crpc, prefetch } from '@/lib/convex/rsc';
import { GamePath, getGameByPath } from '@/lib/games/games';
// import { notFound } from 'next/navigation';

export default async function Page({
  params,
}: PageProps<'/games/[...gamePath]'>) {
  const { gamePath } = (await params) as { gamePath: GamePath };

  prefetch(crpc.users.me.queryOptions());
  /* await */ caller.games.control.maybeStartSession(
    { gamePath },
    { skipUnauth: true }
  );
  prefetch(
    crpc.games.control.getSession.queryOptions(
      { gamePath },
      { skipUnauth: true }
    )
  );

  return <GameRoot gamePath={gamePath} />;
}

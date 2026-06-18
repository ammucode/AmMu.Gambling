import { GameRoot } from '@/components/games/root';
import { caller, crpc, prefetch } from '@/lib/convex/rsc';
import { GamePath } from '@/lib/games/games';

export default async function Page({
  params,
}: PageProps<'/games/[...gamePath]'>) {
  const { gamePath } = (await params) as { gamePath: GamePath };

  prefetch(crpc.users.me.queryOptions());
  /* await */ caller.games.session.maybeStartSession(
    { gamePath },
    { skipUnauth: true }
  );
  prefetch(
    crpc.games.session.getSession.queryOptions(
      { gamePath },
      { skipUnauth: true }
    )
  );

  return <GameRoot gamePath={gamePath} />;
}

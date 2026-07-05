import { GameRoot } from '@/components/games/root';
import { caller, crpc, prefetch } from '@/lib/convex/rsc';
import { GamePath } from '@/lib/games';

export default async function Page({ params }: PageProps<'/games/[...path]'>) {
  const { path } = (await params) as { path: GamePath };

  prefetch(crpc.users.me.queryOptions());
  /* await */ caller.games.session.maybeStartSession(
    { path },
    { skipUnauth: true }
  );
  prefetch(
    crpc.games.session.getSession.queryOptions({ path }, { skipUnauth: true })
  );

  return <GameRoot path={path} />;
}

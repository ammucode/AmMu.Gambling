import { GameRoot } from '@/components/games/root';
import { caller, crpc, prefetch } from '@/lib/convex/rsc';
import { GamePath, getGameByPath } from '@/lib/games/games';
import { notFound } from 'next/navigation';

export default async function Page({ params }: PageProps<'/games/[...game]'>) {
  const { game: maybeGamePath } = await params;

  const games = getGameByPath(maybeGamePath);
  if (!games) {
    notFound();
  }
  const gamePath = maybeGamePath as GamePath;

  prefetch(crpc.users.me.queryOptions());
  const user = await caller.users.me();
  if (user) {
    await caller.games.control.maybeStartSession({
      gamePath: gamePath,
    });
    prefetch(crpc.games.control.getSession.queryOptions({ gamePath }));
  }

  // if (!user) {
  //   return (
  //     <div className="flex h-max w-full flex-col items-center">
  //       <NoAccountBlock />
  //     </div>
  //   );
  // }

  // const session = await caller.games.control.getOrStartSession({
  //   gamePath: gamePath,
  // });
  // crpc

  return (
    // <div className="relative flex h-full w-full flex-col items-center">
    //   <BalanceManager balance={user.balance} session={session} />
    <GameRoot gamePath={gamePath} />
    // </div>
  );
}

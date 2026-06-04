import { NoAccountBlock } from '@/components/blocks/auth/no-account';
import { GameRoot } from '@/components/games/root';
import { caller } from '@/lib/convex/rsc';
import { getGameByPath } from '@/lib/games/games';
import { notFound } from 'next/navigation';

export default async function Page({ params }: PageProps<'/games/[...game]'>) {
  const { game: gamePath } = await params;

  const games = getGameByPath(gamePath);
  if (!games) {
    notFound();
  }

  const user = await caller.users.me();

  if (!user) return <div className='flex flex-col items-center w-full h-max'>
    <NoAccountBlock />
  </div>;

  return <GameRoot games={games} />;
}

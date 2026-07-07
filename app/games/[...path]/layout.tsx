import { SidebarTrigger } from '@ui/sidebar';
import { getGameByPath } from '@/lib/games';
import { notFound } from 'next/navigation';

export default async function Layout({
  children,
  params,
}: LayoutProps<'/games/[...path]'>) {
  const { path } = await params;

  const games = getGameByPath(path);
  if (!games) {
    notFound();
  }

  // const [rootGame, subGame] = games;
  // const activeGame = subGame ?? rootGame;

  return (
    <>
      {/* <header className="relative flex shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14">
        <div className="flex items-center gap-2 px-4">
        </div>
        <h1 className="max-sm:hidden absolute left-[50%] w-max max-w-[90%] translate-x-[-50%] text-5xl font-extrabold text-yellow-600 italic drop-shadow-amber-500">
          {activeGame.title}
        </h1>
      </header> */}
      <div className="relative flex w-full flex-1 flex-col items-center p-4 pt-2 min-h-0">
        {children}
      </div>
    </>
  );
}

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { Game, GAMES, BaseGame, SubGame } from '@/lib/games';
import { ChevronRight } from 'lucide-react';
import Link, { LinkProps } from 'next/link';
import { useMemo } from 'react';

interface GameLinkProps<Raw extends boolean> extends Omit<LinkProps, 'href'> {
  game: BaseGame;
  path?: Raw extends true ? never : string[];
  raw?: Raw;
}
function GameLink<Raw extends boolean>({
  game,
  path,
  raw,
  ...props
}: GameLinkProps<Raw>) {
  const { open, setOpen, setOpenMobile } = useSidebar();
  const href = useMemo(
    () => (open && !raw ? ['', 'games', ...path!].join('/') : ''),
    [open, path, raw]
  );
  const icon = game.icon ? (
    'lucideIcon' in game.icon ? (
      <game.icon.lucideIcon {...game.icon} />
    ) : (
      <game.icon />
    )
  ) : null;
  const children = (
    <>
      {icon}
      <span>{game.title}</span>
    </>
  );
  if (raw) return children;
  return (
    <Link
      href={href}
      {...props}
      onClick={() => (open ? setOpenMobile(false) : setOpen(true))}
    >
      {children}
    </Link>
  );
}

export function NavGames() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Games</SidebarGroupLabel>
      <SidebarMenu>
        {GAMES.map((game: Game) =>
          'subGames' in game ? (
            <Collapsible
              key={game.title}
              // defaultOpen={game.isActive}
              className="group/collapsible"
              render={<SidebarMenuItem />}
            >
              <CollapsibleTrigger
                render={<SidebarMenuButton tooltip={game.title} />}
              >
                <GameLink game={game} raw />
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {game.subGames?.map((subGame: SubGame) => (
                    <SidebarMenuSubItem key={subGame.title}>
                      <SidebarMenuSubButton
                        render={
                          <GameLink
                            game={subGame}
                            path={[game.path, subGame.path]}
                          />
                        }
                      />
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={game.title}>
              <SidebarMenuButton
                tooltip={game.title}
                render={<GameLink game={game} path={[game.path]} />}
              />
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}

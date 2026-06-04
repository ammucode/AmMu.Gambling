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
import { Game, GAMES, BaseGame, RootGame, SubGame } from '@/lib/games/games';
import { ChevronRight, Circle, Dices, Spade, Square } from 'lucide-react';
import Link, { LinkProps } from 'next/link';
import React, { useMemo } from 'react';
import { JSX } from 'react/jsx-runtime';

interface GameLinkProps extends Omit<LinkProps, 'href'> {
  game: RootGame | SubGame;
  path: string[];
}
function GameLink({ game, path, ...props }: GameLinkProps) {
  const { open, setOpen, setOpenMobile } = useSidebar();
  const href = useMemo(
    () => (open ? ['', 'games', ...path].join('/') : ''),
    [open, path]
  );
  return (
    <Link
      href={href}
      {...props}
      onClick={() => (open ? setOpenMobile(false) : setOpen(true))}
    >
      {game.icon && <game.icon />}
      <span>{game.title}</span>
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
                {game.icon && <game.icon />}
                <span>{game.title}</span>
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

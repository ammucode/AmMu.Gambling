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
import { Game, GAMES, BaseGame, SubGame, GamePathString } from '@/lib/games';
import { GameComponentDefs, GameIcon } from '@/lib/games/client';
import { ChevronRight } from 'lucide-react';
import Link, { LinkProps } from 'next/link';
import React, { useMemo } from 'react';

interface GameLinkProps<Raw extends boolean> extends Omit<LinkProps, 'href'> {
  game: BaseGame;
  Icon?: GameIcon;
  path?: Raw extends true ? never : string[];
  raw?: Raw;
}
function GameLink<Raw extends boolean>({
  game,
  Icon,
  path,
  raw,
  ...props
}: GameLinkProps<Raw>) {
  const { open, setOpen, setOpenMobile } = useSidebar();
  const href = useMemo(
    () => (open && !raw ? ['', 'games', ...path!].join('/') : ''),
    [open, path, raw]
  );
  const renderedIcon = Icon ? (
    'lucideIcon' in Icon
      ? <Icon.lucideIcon {...Icon} />
      : <Icon />
  ) : null;
  const children = (
    <>
      {renderedIcon}
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
        {GAMES.map((game: Game) => {
          const hasSubGames = 'subGames' in game;
          const baseComponents = hasSubGames ? GameComponentDefs[`${game.path}/${game.subGames![0].path}` as GamePathString] : GameComponentDefs[`${game.path}` as GamePathString];
          const baseIcon = baseComponents[0].icon;
          if (hasSubGames) {
            return (
              <Collapsible
                key={game.title}
                // defaultOpen={game.isActive}
                className="group/collapsible"
                render={<SidebarMenuItem />}
              >
                <CollapsibleTrigger
                  render={<SidebarMenuButton tooltip={game.title} />}
                >
                  <GameLink game={game} Icon={baseIcon} raw />
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
            );
          } else {
            return (
              <SidebarMenuItem key={game.title}>
                <SidebarMenuButton
                  tooltip={game.title}
                  render={<GameLink game={game} Icon={baseIcon} path={[game.path]} />}
                />
              </SidebarMenuItem>
            );
          }
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

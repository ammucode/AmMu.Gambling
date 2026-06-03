import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from "@/components/ui/sidebar";
import { Game, GAMES, SubGame } from "@/lib/games/games";
import { ChevronRight, Circle, Dices, Spade, Square } from "lucide-react";
import Link, { LinkProps } from "next/link";
import React from "react";
import { JSX } from "react/jsx-runtime";

interface GameLinkProps extends Omit<LinkProps, 'href'> {
  path: string[];
  children?: React.ReactNode;
}
function GameLink({path, children, ...props}: GameLinkProps) {
  return <Link href={['', 'games', ...path].join('/')} {...props}>
    {children}
  </Link>;
}

export function NavGames() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Games</SidebarGroupLabel>
      <SidebarMenu>
        {GAMES.map((game: Game) => ('subGames' in game
          ? <Collapsible
            key={game.title}
            defaultOpen={game.isActive}
            className="group/collapsible"
            render={<SidebarMenuItem />}
          >
            <CollapsibleTrigger render={<SidebarMenuButton tooltip={game.title} />}>
              {game.icon && <game.icon />}
              <span>{game.title}</span>
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {game.subGames?.map((subGame: SubGame) => (
                  <SidebarMenuSubItem key={subGame.title}>
                    <SidebarMenuSubButton render={<GameLink path={[game.path, subGame.path]} />}>
                      {subGame.icon && <subGame.icon />}
                      <span>{subGame.title}</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>
          : <SidebarMenuItem 
            key={game.title}
          >
            <SidebarMenuButton tooltip={game.title} render={<GameLink path={[game.path]} />}>
              {game.icon && <game.icon />}
              <span>{game.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
'use client';

import { cn } from "@/lib/utils";
import React from "react";

export interface HeaderProps extends React.ComponentProps<"header"> {
  id: React.ComponentProps<"header">['id'];
};
export default function Header({ children, className, ...headerProps }: React.PropsWithChildren<HeaderProps>) {
  return (
    <header className={cn(
      "w-full p-2 pb-0 flex flex-row items-center gap-0 justify-start"
    )} { ...headerProps }>
      {children}
    </header>
  );
}
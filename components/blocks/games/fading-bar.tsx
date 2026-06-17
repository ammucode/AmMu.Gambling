import { cn } from "@/lib/utils";
import { Separator } from "@ui/separator";
import React from "react";

function Divider() {
  return <Separator orientation="vertical" />;
}

export interface FadingBarProps {
  className?: string;
  children: React.ReactNode[]|React.ReactNode;
}
export function FadingBar({ className, children }: FadingBarProps) {
  const fullChildren = !Array.isArray(children) ? [children] : children.reduce((acc: React.ReactNode[], curr, i, arr) => {
    return [...acc, curr, ...(i < arr.length-1 ? [<Divider />] : [])];
  }, []);
  return (
    <div className={cn("flex flex-row h-12 items-center px-2 gap-2 bg-linear-to-r from-green-900/0 via-green-900/60 via-30% to-green-950 inset-shadow-sm inset-shadow-green-900/50", className)}>
      {fullChildren.map((child,i) => (<React.Fragment key={i}>{child}</React.Fragment>))}
    </div>
  );
}
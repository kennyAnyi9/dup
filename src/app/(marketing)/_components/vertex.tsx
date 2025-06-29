import { cn } from "@/shared/lib/utils";
import React from "react";

export function Vertex({
  className,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="vertex"
      className={cn(
        "flex justify-center items-center gap-2 lg:border-r w-28 sm:w-44 border-edge",
        className
      )}
      {...props}
    />
  );
}

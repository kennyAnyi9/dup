import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/dupui/avatar";

interface PasteCardHeaderProps {
  user?: {
    id: string;
    name: string;
    image: string | null;
  } | null;
}

export function PasteCardHeader({ user }: PasteCardHeaderProps) {
  return (
    <>
      {user ? (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage
            src={user.image || undefined}
            alt={user.name}
          />
          <AvatarFallback className="text-xs bg-muted">
            {user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="flex-none rounded-full border border-border bg-gradient-to-t from-muted p-2">
          <div className="h-6 w-6 rounded-full bg-muted-foreground/20" />
        </div>
      )}
    </>
  );
}
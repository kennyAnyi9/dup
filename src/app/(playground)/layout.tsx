import { Header } from "@/app/(playground)/_components/marketing-header";
import { ReactNode } from "react";

interface PlaygroundLayoutProps {
  children: ReactNode;
}

export default function PlaygroundLayout({ children }: PlaygroundLayoutProps) {
  return (
    <div className="h-screen overflow-x-hidden overflow-y-auto">
      <Header />
      {children}
    </div>
  );
}

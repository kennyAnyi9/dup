import { ReactNode } from "react";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </div>
  );
}
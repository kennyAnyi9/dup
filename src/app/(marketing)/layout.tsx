import { ReactNode } from "react";

interface MarketingLayoutProps {
  children: ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="h-screen overflow-x-hidden overflow-y-auto">
      {children}
    </div>
  );
}

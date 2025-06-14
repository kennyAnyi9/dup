import { PublicPasteClient } from "@/components/shared/paste/public-paste-client";
import { PasteModalProvider } from "@/components/shared/paste/paste-modal-provider";

interface PastePageProps {
  params: Promise<{ slug: string }>;
}

export default async function PastePage({ params }: PastePageProps) {
  const { slug } = await params;
  
  return (
    <PasteModalProvider>
      <PublicPasteClient slug={slug} />
    </PasteModalProvider>
  );
}
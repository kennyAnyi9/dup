import { PublicPasteClient } from "@/features/paste/components/composite/public-paste-client";
import { PasteModalProvider } from "@/features/paste/components/providers/paste-modal-provider";

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
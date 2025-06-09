import { PublicPasteClient } from "@/components/paste/public-paste-client";

interface PastePageProps {
  params: Promise<{ slug: string }>;
}

export default async function PastePage({ params }: PastePageProps) {
  const { slug } = await params;
  
  return <PublicPasteClient slug={slug} />;
}
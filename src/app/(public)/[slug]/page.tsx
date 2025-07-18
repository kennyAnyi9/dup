import { redirect } from "next/navigation";

interface PastePageProps {
  params: Promise<{ slug: string }>;
}

export default async function PastePage({ params }: PastePageProps) {
  const { slug } = await params;
  
  // Redirect old URLs to new /p/ namespace
  redirect(`/p/${slug}`);
}
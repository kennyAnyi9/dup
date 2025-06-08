import { Metadata } from "next";
import { notFound } from "next/navigation";

interface PastePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PastePageProps): Promise<Metadata> {
  const { id } = await params;
  
  return {
    title: `Paste ${id}`,
    description: "View shared code snippet",
  };
}

export default async function PastePage({ params }: PastePageProps) {
  const { id } = await params;
  
  // TODO: Fetch paste data
  if (!id) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Paste: {id}</h1>
        <p className="text-muted-foreground">Shared code snippet</p>
      </div>
      
      <div className="bg-muted/50 p-8 rounded-lg text-center">
        <p className="text-muted-foreground">Paste viewer will be implemented here</p>
      </div>
    </div>
  );
}
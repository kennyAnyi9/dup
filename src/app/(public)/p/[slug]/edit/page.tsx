import { notFound, redirect } from "next/navigation";
import { getPasteForEdit } from "@/features/paste/actions/paste.actions";
import { EditPasteForm } from "./components/edit-paste-form";

interface EditPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EditPage({ params }: EditPageProps) {
  const { slug } = await params;
  
  // Atomic authorization check - combines authentication and ownership verification
  const result = await getPasteForEdit({ slug });
  
  if (!result.success) {
    // If it's an auth error, redirect to login
    if (result.error === "Authentication required") {
      redirect("/login");
    }
    // Otherwise, it's either not found or access denied
    notFound();
  }

  return <EditPasteForm paste={result.paste!} />;
}
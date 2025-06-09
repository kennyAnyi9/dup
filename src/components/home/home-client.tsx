"use client";

import { PasteFormModal } from "@/components/paste/paste-form-modal";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Eye, FileText, Link2, Lock, Zap } from "lucide-react";
import { useState } from "react";

export function HomeClient() {
  const [modalOpen, setModalOpen] = useState(false);
  const [ctaContent, setCtaContent] = useState("");

  return (
    <>
      {/* CTA div */}
      <div className="relative overflow-hidden max-w-3xl mx-auto ">
        <div className="relative p-8">
          <div className="space-y-6">
            <div className="cursor-pointer" onClick={() => setModalOpen(true)}>
              <Textarea
                placeholder="Click here to start pasting your content..."
                className="min-h-[120px] resize-none cursor-pointer bg-background/50  hover:bg-background/80 transition-colors focus:cursor-text"
                value={ctaContent}
                onChange={(e) => setCtaContent(e.target.value)}
                onFocus={() => setModalOpen(true)}
                readOnly
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 justify-center">
              <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1">
                <Zap className="h-3 w-3" />
                Burn After Read
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1">
                <Lock className="h-3 w-3" />
                Password Protection
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1">
                <FileText className="h-3 w-3" />
                Syntax Highlighting
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1">
                <Clock className="h-3 w-3" />
                Custom Expiry
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1">
                <Link2 className="h-3 w-3" />
                Custom URLs
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1">
                <Eye className="h-3 w-3" />
                Track Views
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Paste Form Modal */}
      <PasteFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialContent={ctaContent}
      />
    </>
  );
}

"use client";

import { useState } from "react";
import { PasteFormModal } from "@/components/paste/paste-form-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Code2, Plus, Sparkles } from "lucide-react";

export function HomeClient() {
  const [modalOpen, setModalOpen] = useState(false);
  const [ctaContent, setCtaContent] = useState("");

  return (
    <>
      {/* CTA Card */}
      <Card className="relative overflow-hidden border-dashed border-2 hover:border-primary/30 transition-colors">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10" />
        <CardContent className="relative p-8">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Code2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Ready to share?</h3>
                <p className="text-muted-foreground">
                  Click below to create your paste in seconds
                </p>
              </div>
            </div>

            <div
              className="cursor-pointer"
              onClick={() => setModalOpen(true)}
            >
              <Textarea
                placeholder="Click here to start pasting your content..."
                className="min-h-[120px] resize-none cursor-pointer bg-background/50 border-dashed hover:bg-background/80 transition-colors focus:cursor-text"
                value={ctaContent}
                onChange={(e) => setCtaContent(e.target.value)}
                onFocus={() => setModalOpen(true)}
                readOnly
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button
                onClick={() => setModalOpen(true)}
                size="lg"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create New Paste
              </Button>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span>Free • Fast • Secure</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Paste Form Modal */}
      <PasteFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialContent={ctaContent}
      />
    </>
  );
}
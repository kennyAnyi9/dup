"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Textarea } from "@/shared/components/dupui/textarea";
import { Button } from "@/shared/components/dupui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/dupui/dialog";
import { ScrollArea } from "@/shared/components/dupui/scroll-area";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/shared/components/dupui/form";
import { CharacterCounter } from "@/features/paste/components/ui/character-counter";

export default function DebugPage() {
  const [content1, setContent1] = useState("");
  const [content2, setContent2] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [exactModalOpen, setExactModalOpen] = useState(false);
  const [uncontrolledModalOpen, setUncontrolledModalOpen] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const form = useForm({
    defaultValues: { content: "" }
  });

  const exactForm = useForm({
    defaultValues: { 
      content: "",
      title: "",
      description: "",
      language: "plain",
      visibility: "public",
      burnAfterRead: false
    }
  });

  // Exact same watchers as current form
  const watchedContent = exactForm.watch("content") || "";

  // Uncontrolled textarea handler
  const handleUncontrolledInput = () => {
    if (textareaRef.current) {
      setCharCount(textareaRef.current.value.length);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl p-4 space-y-8">
      <h1 className="text-2xl font-bold">Performance Debug Tests</h1>
      
      {/* Test 1: Simple useState - Baseline */}
      <div className="border p-4 rounded">
        <h2 className="text-lg font-semibold mb-4">Test 1: Simple useState (Baseline)</h2>
        <Textarea
          value={content1}
          onChange={(e) => setContent1(e.target.value)}
          placeholder="Test typing here - should be fast..."
          className="min-h-[200px] font-mono"
          spellCheck={false}
        />
        <p className="text-sm text-muted-foreground mt-2">{content1.length} characters</p>
      </div>

      {/* Test 2: React Hook Form */}
      <div className="border p-4 rounded">
        <h2 className="text-lg font-semibold mb-4">Test 2: React Hook Form</h2>
        <Textarea
          {...form.register("content")}
          placeholder="Test with React Hook Form..."
          className="min-h-[200px] font-mono"
          spellCheck={false}
        />
        <p className="text-sm text-muted-foreground mt-2">{form.watch("content")?.length || 0} characters</p>
      </div>

      {/* Test 3: Modal with useState */}
      <div className="border p-4 rounded">
        <h2 className="text-lg font-semibold mb-4">Test 3: Modal with useState</h2>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button>Open Modal Test</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modal Performance Test</DialogTitle>
            </DialogHeader>
            <Textarea
              value={content2}
              onChange={(e) => setContent2(e.target.value)}
              placeholder="Test typing in modal..."
              className="min-h-[200px] font-mono"
              spellCheck={false}
            />
            <p className="text-sm text-muted-foreground">{content2.length} characters</p>
          </DialogContent>
        </Dialog>
      </div>

      {/* Test 4: Exact Current Form Structure */}
      <div className="border p-4 rounded">
        <h2 className="text-lg font-semibold mb-4">Test 4: Exact Current Form Structure</h2>
        <Dialog open={exactModalOpen} onOpenChange={setExactModalOpen}>
          <DialogTrigger asChild>
            <Button>Open Exact Form Test</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[90vw] w-full max-h-[85vh] sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl p-0 gap-0 flex flex-col">
            <DialogHeader className="px-3 sm:px-4 py-2 sm:py-3 border-b space-y-2 shrink-0">
              <DialogTitle>Exact Form Test</DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-[calc(85vh-120px)]">
                <Form {...exactForm}>
                  <div className="space-y-4 p-4">
                    <FormField
                      control={exactForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-sm font-medium">Content</FormLabel>
                            <CharacterCounter
                              current={watchedContent.length}
                              limit={null}
                            />
                          </div>
                          <FormControl>
                            <Textarea
                              placeholder="Paste your content here..."
                              className="min-h-[200px] text-sm font-mono border rounded-md resize-none"
                              spellCheck={false}
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </Form>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Test 5: Uncontrolled Component */}
      <div className="border p-4 rounded">
        <h2 className="text-lg font-semibold mb-4">Test 5: Uncontrolled Textarea (Should Fix Backspace Lag)</h2>
        <Dialog open={uncontrolledModalOpen} onOpenChange={setUncontrolledModalOpen}>
          <DialogTrigger asChild>
            <Button>Open Uncontrolled Test</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[90vw] w-full max-h-[85vh] sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl p-0 gap-0 flex flex-col">
            <DialogHeader className="px-3 sm:px-4 py-2 sm:py-3 border-b space-y-2 shrink-0">
              <DialogTitle>Uncontrolled Test</DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-[calc(85vh-120px)]">
                <div className="space-y-4 p-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Content (Uncontrolled)</label>
                      <div className="text-xs text-muted-foreground">
                        {charCount} characters
                      </div>
                    </div>
                    <Textarea
                      ref={textareaRef}
                      placeholder="Test backspace performance here..."
                      className="min-h-[200px] text-sm font-mono border rounded-md resize-none"
                      spellCheck={false}
                      onInput={handleUncontrolledInput}
                    />
                  </div>
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
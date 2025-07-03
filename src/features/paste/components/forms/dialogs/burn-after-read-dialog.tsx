"use client";

import { useState } from "react";
import { Button } from "@/shared/components/dupui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/dupui/dialog";
import { Input } from "@/shared/components/dupui/input";
import { Label } from "@/shared/components/dupui/label";
import { Flame, Check } from "lucide-react";
import { usePasteForm } from "../hooks/use-paste-form";

interface BurnAfterReadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: ReturnType<typeof usePasteForm>["form"];
}

const PRESET_OPTIONS = [
  { value: 1, label: "1 view" },
  { value: 3, label: "3 views" },
  { value: 5, label: "5 views" },
  { value: 10, label: "10 views" },
];

export function BurnAfterReadDialog({
  open,
  onOpenChange,
  form,
}: BurnAfterReadDialogProps) {
  const [selectedOption, setSelectedOption] = useState<"off" | "preset" | "custom">("off");
  const [presetValue, setPresetValue] = useState<number>(1);
  const [customValue, setCustomValue] = useState<string>("");

  const currentBurnAfterRead = form.watch("burnAfterRead");
  const currentViews = form.watch("burnAfterReadViews");

  // Initialize state based on current form values
  const initializeState = () => {
    if (!currentBurnAfterRead) {
      setSelectedOption("off");
    } else if (currentViews && PRESET_OPTIONS.some(opt => opt.value === currentViews)) {
      setSelectedOption("preset");
      setPresetValue(currentViews);
    } else if (currentViews) {
      setSelectedOption("custom");
      setCustomValue(currentViews.toString());
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      initializeState();
    }
    onOpenChange(newOpen);
  };

  const handleSave = () => {
    if (selectedOption === "off") {
      form.setValue("burnAfterRead", false);
      form.setValue("burnAfterReadViews", undefined);
    } else if (selectedOption === "preset") {
      form.setValue("burnAfterRead", true);
      form.setValue("burnAfterReadViews", presetValue);
    } else if (selectedOption === "custom") {
      const numValue = parseInt(customValue);
      if (numValue > 0 && numValue <= 1000) {
        form.setValue("burnAfterRead", true);
        form.setValue("burnAfterReadViews", numValue);
      }
    }
    onOpenChange(false);
  };

  const isCustomValid = customValue && parseInt(customValue) > 0 && parseInt(customValue) <= 1000;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Flame className="h-4 w-4 text-destructive" />
            Burn After Read
          </DialogTitle>
          <DialogDescription className="text-sm">
            Auto-delete after specified views
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Off Option */}
          <button
            type="button"
            onClick={() => setSelectedOption("off")}
            className={`w-full flex items-center gap-2 p-2 rounded-md border transition-all ${
              selectedOption === "off"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${
              selectedOption === "off" ? "border-primary" : "border-muted-foreground"
            }`}>
              {selectedOption === "off" && <Check className="h-2 w-2 text-primary" />}
            </div>
            <span className="text-sm font-medium">Off</span>
            <span className="text-xs text-muted-foreground ml-auto">Keep permanently</span>
          </button>

          {/* Preset Options */}
          <button
            type="button"
            onClick={() => setSelectedOption("preset")}
            className={`w-full flex items-center gap-2 p-2 rounded-md border transition-all ${
              selectedOption === "preset"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${
              selectedOption === "preset" ? "border-primary" : "border-muted-foreground"
            }`}>
              {selectedOption === "preset" && <Check className="h-2 w-2 text-primary" />}
            </div>
            <span className="text-sm font-medium">Quick Select</span>
            <span className="text-xs text-muted-foreground ml-auto">Common options</span>
          </button>

          {selectedOption === "preset" && (
            <div className="ml-5 grid grid-cols-4 gap-2">
              {PRESET_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPresetValue(option.value)}
                  className={`p-1.5 rounded border text-xs transition-all ${
                    presetValue === option.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {/* Custom Option */}
          <button
            type="button"
            onClick={() => setSelectedOption("custom")}
            className={`w-full flex items-center gap-2 p-2 rounded-md border transition-all ${
              selectedOption === "custom"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${
              selectedOption === "custom" ? "border-primary" : "border-muted-foreground"
            }`}>
              {selectedOption === "custom" && <Check className="h-2 w-2 text-primary" />}
            </div>
            <span className="text-sm font-medium">Custom</span>
            <span className="text-xs text-muted-foreground ml-auto">Set your own</span>
          </button>

          {selectedOption === "custom" && (
            <div className="ml-5 space-y-2">
              <Label htmlFor="custom-views" className="text-xs text-muted-foreground">
                Views (1-1000)
              </Label>
              <Input
                id="custom-views"
                type="number"
                min="1"
                max="1000"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                placeholder="Enter number..."
                className="h-8 text-sm"
              />
              {customValue && !isCustomValid && (
                <p className="text-xs text-destructive">
                  Number between 1-1000 required
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            size="sm"
            onClick={handleSave}
            disabled={selectedOption === "custom" && !isCustomValid}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
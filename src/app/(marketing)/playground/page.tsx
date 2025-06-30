import { ThemeSwitch } from "@/shared/components/theme/theme-switch";

export default function PlaygroundPage() {
  return (
    <div className="h-screen overflow-hidden">
      <div className="flex items-center justify-center h-full">
        <ThemeSwitch />
      </div>
    </div>
  );
}

import { ThemeSwitch } from "@/components/ui/theme/theme-switch";

export default function Home() {
  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center gap-8">
      <h1 className="text-4xl font-bold">Theme Switch Test</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Test the theme switch below. Use keyboard shortcuts: 
        <br />
        <code className="bg-muted px-2 py-1 rounded text-sm">L</code> for light mode
        <br />
        <code className="bg-muted px-2 py-1 rounded text-sm">D</code> for dark mode
      </p>
      <ThemeSwitch />
    </div>
  );
}

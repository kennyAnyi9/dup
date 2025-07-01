export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full overflow-hidden bg-background">
      {children}
    </div>
  );
}
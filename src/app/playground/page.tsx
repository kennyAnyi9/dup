import { PasteCardView } from "@/features/paste/components/ui/paste-card-view";

const mockPaste1 = {
  id: "1",
  slug: "my-python-script",
  title: "My Python Script",
  description: "A helpful Python utility for data processing",
  content: "# Python script content here...",
  language: "python",
  visibility: "public",
  views: 68300,
  createdAt: new Date("2024-01-15"),
  expiresAt: null,
  burnAfterRead: false,
  burnAfterReadViews: null,
  hasPassword: false,
  tags: [
    { id: "1", name: "python", slug: "python", color: "#3776ab" },
    { id: "2", name: "utility", slug: "utility", color: "#6366f1" }
  ],
  user: {
    id: "user1",
    name: "John Doe",
    image: null
  }
};

const mockPaste2 = {
  id: "2",
  slug: "react-component",
  title: "React Component Helper",
  description: "Reusable React component with TypeScript",
  content: "// React component code...",
  language: "typescript",
  visibility: "public",
  views: 1234,
  createdAt: new Date("2024-01-10"),
  expiresAt: null,
  burnAfterRead: false,
  burnAfterReadViews: null,
  hasPassword: true,
  tags: [
    { id: "3", name: "react", slug: "react", color: "#61dafb" },
    { id: "4", name: "typescript", slug: "typescript", color: "#3178c6" }
  ],
  user: {
    id: "user2",
    name: "Jane Smith",
    image: "https://avatars.githubusercontent.com/u/1?v=4"
  }
};

export default function PlaygroundPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Playground - Paste Card View</h1>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Python Script Example</h2>
          <PasteCardView paste={mockPaste1} />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">React Component Example</h2>
          <PasteCardView paste={mockPaste2} />
        </div>
      </div>
    </div>
  );
}
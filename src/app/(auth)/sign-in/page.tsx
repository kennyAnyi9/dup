import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your account",
};

export default function SignInPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground">Sign in to your account</p>
      </div>
      
      <div className="bg-muted/50 p-8 rounded-lg text-center">
        <p className="text-muted-foreground">Sign in form will be implemented here</p>
      </div>
    </div>
  );
}
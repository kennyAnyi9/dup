import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new account",
};

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-muted-foreground">Get started with your free account</p>
      </div>
      
      <div className="bg-muted/50 p-8 rounded-lg text-center">
        <p className="text-muted-foreground">Sign up form will be implemented here</p>
      </div>
    </div>
  );
}
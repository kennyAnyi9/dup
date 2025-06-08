"use client";

import { useEffect, useState } from "react";

export default function TestAuthPage() {
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testAuthEndpoint() {
      try {
        // Test if the auth API is accessible
        const response = await fetch("/api/auth-simple", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        const data = await response.json();
        setAuthStatus({
          success: true,
          status: response.status,
          data: data,
        });
      } catch (error) {
        setAuthStatus({
          success: false,
          error: error,
        });
      } finally {
        setLoading(false);
      }
    }

    testAuthEndpoint();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Auth API Test</h1>
        <p>Testing auth endpoint...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Auth API Test</h1>
      <div className={`p-4 rounded ${authStatus.success ? "bg-green-100" : "bg-red-100"}`}>
        <p>{authStatus.success ? "✅ Auth API accessible!" : "❌ Auth API failed!"}</p>
        <pre className="mt-4 bg-gray-100 p-2 rounded text-sm overflow-auto">
          {JSON.stringify(authStatus, null, 2)}
        </pre>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Environment Check</h2>
        <div className="bg-blue-100 p-4 rounded">
          <p>NEXT_PUBLIC_APP_URL: {process.env.NEXT_PUBLIC_APP_URL || "Not set"}</p>
          <p>NODE_ENV: {process.env.NODE_ENV}</p>
        </div>
      </div>
    </div>
  );
}
import { db } from "@/db";
import { user } from "@/db/schema";

export default async function TestDbPage() {
  try {
    // Test database connection by counting users
    const userCount = await db.select().from(user);
    
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
        <div className="bg-green-100 p-4 rounded">
          <p>✅ Database connected successfully!</p>
          <p>Users in database: {userCount.length}</p>
          <pre className="mt-4 bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify(userCount, null, 2)}
          </pre>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
        <div className="bg-red-100 p-4 rounded">
          <p>❌ Database connection failed!</p>
          <pre className="mt-4 bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      </div>
    );
  }
}
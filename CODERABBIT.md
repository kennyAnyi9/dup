src/features/paste/components/ui/comments/comment-item.tsx (1)
82-86: Guard against negative like counts

A quick unlike on a comment whose likeCount is already 0 would push the value to -1. Clamp the lower bound to 0:

-const newLikeCount = newIsLiked ? originalLikeCount + 1 : originalLikeCount - 1;
+const newLikeCount = newIsLiked

- ? originalLikeCount + 1
- : Math.max(originalLikeCount - 1, 0);

⚠️ Potential issue

min is not a recognised pg Pool option

node-postgres only honours max, idleTimeoutMillis, connectionTimeoutMillis, allowExitOnIdle, etc. Supplying min is silently ignored, which can mislead maintainers into thinking the pool keeps two warm connections. If you require a minimum-size pool, you need to front the pool with a library such as generic-pool or keep a small cron that performs lightweight queries.

- min: 2,
  Remove the line (or refactor to a supported approach) to avoid future confusion.

📝 Committable suggestion
‼️ IMPORTANT
Carefully review the code before committing. Ensure that it accurately replaces the highlighted code, contains no missing lines, and has no issues with indentation. Thoroughly test & benchmark the code to ensure it meets the requirements.

Suggested change
max: 20,
min: 2,
idleTimeoutMillis: 30000,
connectionTimeoutMillis: 10000,
max: 20,
idleTimeoutMillis: 30000,
connectionTimeoutMillis: 10000,
🤖 Prompt for AI Agents
In src/db/index.ts around lines 8 to 12, the 'min' option is not supported by
the pg Pool and is silently ignored, which can mislead maintainers. Remove the
'min: 2' line from the pool configuration to avoid confusion. If a minimum pool
size is needed, consider using an external pooling library or a keep-alive
mechanism instead.

🛠️ Refactor suggestion

Handle edge cases in getUserInitials function.

The function has potential issues with empty names and edge cases:

Empty strings or whitespace-only names will cause issues
Names with only single characters won't be handled optimally
No input validation for the user parameter
Apply this improved implementation:

export function getUserInitials(user: User): string {

- // Validate input
- if (!user?.email) {
- return "?";
- }
-

* if (user.name) {

- if (user.name?.trim()) {

* return user.name

- return user.name.trim()
  .split(" ")
-      .filter(part => part.length > 0)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
  }
  // Fallback to email if no name
  return user.email[0].toUpperCase();
  }
  📝 Committable suggestion
  ‼️ IMPORTANT
  Carefully review the code before committing. Ensure that it accurately replaces the highlighted code, contains no missing lines, and has no issues with indentation. Thoroughly test & benchmark the code to ensure it meets the requirements.

Suggested change
export function getUserInitials(user: User): string {
if (user.name) {
return user.name
.split(" ")
.map((n) => n[0])
.join("")
.toUpperCase()
.slice(0, 2);
}

// Fallback to email if no name
return user.email[0].toUpperCase();
}
export function getUserInitials(user: User): string {
// Validate input
if (!user?.email) {
return "?";
}

if (user.name?.trim()) {
return user.name
.trim()
.split(" ")
.filter(part => part.length > 0)
.map((n) => n[0])
.join("")
.toUpperCase()
.slice(0, 2);
}

// Fallback to email if no name
return user.email[0].toUpperCase();
}
🤖 Prompt for AI Agents
In src/shared/types/auth.ts around lines 25 to 37, the getUserInitials function
lacks input validation and does not handle edge cases such as empty or
whitespace-only names and single-character names. Add validation to check if
user and user.name exist and are non-empty after trimming. For names, split by
spaces, filter out empty parts, and safely extract initials, handling
single-character names properly. If no valid name is present, fallback to the
first character of the email, ensuring it exists. This will make the function
more robust and prevent runtime errors.

💡 Verification agent

🧩 Analysis chain
Align User.name type with database schema

The database schema in src/db/schema.ts defines name as notNull(), but the User interface in src/shared/types/auth.ts declares it as optional (string | null). This mismatch can lead to type inconsistencies.

Please update the User interface:

File: src/shared/types/auth.ts
Change:
-export interface User {

id: string;
name?: string | null;
+export interface User {
id: string;
name: string;
email: string;
image?: string | null;
}

Fixes:

- Ensures TypeScript reflects that `name` is always present.
- Eliminates unnecessary `null` checks when accessing `user.name`.

<!-- suggestion_start -->

<details>
<summary>📝 Committable suggestion</summary>

> ‼️ **IMPORTANT**
> Carefully review the code before committing. Ensure that it accurately replaces the highlighted code, contains no missing lines, and has no issues with indentation. Thoroughly test & benchmark the code to ensure it meets the requirements.

```suggestion
export interface User {
id: string;
name: string;
email: string;
image?: string | null;
}
🤖 Prompt for AI Agents
In src/shared/types/auth.ts between lines 3 and 8, update the User interface to
make the name property required and non-nullable by changing its type from
"string | null | optional" to just "string". This aligns the interface with the
database schema in src/db/schema.ts where name is defined as notNull(), ensuring
type consistency and removing the need for null checks on user.name.
```

In src/shared/types/ui.ts at the top of the file, add an import statement for
React to ensure proper type resolution for React.ReactNode. Specifically, add
"import React from 'react';" before any type declarations to avoid TypeScript
errors related to missing React types.

#!/usr/bin/env tsx

import { getPublicPastesPaginated } from "../src/features/paste/actions/paste.actions";

async function testPagination() {
  console.log("Testing pagination function...");
  
  try {
    const result = await getPublicPastesPaginated(1, 8);
    console.log("Result:", JSON.stringify(result, null, 2));
    
    if (result.pastes) {
      console.log(`\nFound ${result.pastes.length} pastes`);
      console.log("Pagination info:", result.pagination);
      console.log("Has more?", result.pagination?.hasMore);
    }
  } catch (error) {
    console.error("Error testing pagination:", error);
  }
}

testPagination().then(() => {
  console.log("Test completed");
  process.exit(0);
}).catch(console.error);
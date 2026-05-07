import { revalidatePath } from "next/cache";

// This script can only be run within the Next.js environment
// However, we can create a temporary API route or just tell the user to rebuild.

// A better way for VPS users:
console.log("🚀 To clear the cache on your VPS, please run:");
console.log("rm -rf .next/cache && pm2 restart all");

// If they want a programmatic way, we'd need an API route.

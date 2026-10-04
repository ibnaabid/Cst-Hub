import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

// ======================
// Environment check
// ======================
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "❌ MONGODB_URI is missing! Please add it in .env.local"
  );
}

const client = new MongoClient(MONGODB_URI);
const db = client.db("CST");

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),

  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret:
    process.env.BETTER_AUTH_SECRET ||
    "fallback-secret-key-change-this-in-production-123456",

  emailAndPassword: {
    enabled: true,
  },

  // GitHub optional — empty থাকলে error দিবে না
  socialProviders: {
    ...(process.env.GITHUB_CLIENT_ID &&
      process.env.GITHUB_CLIENT_SECRET && {
        github: {
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
        },
      }),
  },
});
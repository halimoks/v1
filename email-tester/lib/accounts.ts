import type { SeedAccount } from "@/types";

/**
 * Parses seed accounts from environment variables.
 * Format: SEED_ACCOUNTS = JSON array string
 * Example .env.local:
 *
 * SEED_ACCOUNTS=[
 *   {"id":"s1","label":"Gmail Seed 1","email":"seed1@gmail.com","password":"abcd efgh ijkl mnop","host":"imap.gmail.com","port":993},
 *   {"id":"s2","label":"Gmail Seed 2","email":"seed2@gmail.com","password":"xxxx xxxx xxxx xxxx","host":"imap.gmail.com","port":993}
 * ]
 */
export function getSeedAccounts(): SeedAccount[] {
  const raw = process.env.SEED_ACCOUNTS;
  if (!raw) {
    // Return demo accounts for development if no env var is set
    return [
      {
        id: "demo1",
        label: "Demo Seed 1",
        email: "demo1@gmail.com",
        password: "",
        host: "imap.gmail.com",
        port: 993,
      },
      {
        id: "demo2",
        label: "Demo Seed 2",
        email: "demo2@gmail.com",
        password: "",
        host: "imap.gmail.com",
        port: 993,
      },
    ];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("SEED_ACCOUNTS must be a JSON array");
    return parsed as SeedAccount[];
  } catch (err) {
    console.error("Failed to parse SEED_ACCOUNTS env var:", err);
    return [];
  }
}

/** Strip sensitive fields before sending to the client */
export function maskAccount(account: SeedAccount) {
  return {
    id: account.id,
    label: account.label,
    email: account.email,
    host: account.host,
  };
}

import { NextRequest, NextResponse } from "next/server";
import { getSeedAccounts } from "@/lib/accounts";
import { checkAccount } from "@/lib/imap";
import type { CheckResponse } from "@/types";

// Allow up to 60s for Vercel Pro, 10s for Hobby
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId"); // Optional: check single account

  const accounts = getSeedAccounts();

  if (accounts.length === 0) {
    return NextResponse.json(
      { error: "No seed accounts configured. Set SEED_ACCOUNTS in .env.local" },
      { status: 500 }
    );
  }

  // Filter to single account if requested
  const toCheck = accountId ? accounts.filter((a) => a.id === accountId) : accounts;

  if (toCheck.length === 0) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  // Check all accounts in parallel
  const results = await Promise.all(toCheck.map((account) => checkAccount(account)));

  const response: CheckResponse = {
    results,
    checkedAt: new Date().toISOString(),
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

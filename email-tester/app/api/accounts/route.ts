import { NextResponse } from "next/server";
import { getSeedAccounts, maskAccount } from "@/lib/accounts";

export const dynamic = "force-dynamic";

export async function GET() {
  const accounts = getSeedAccounts();
  const safe = accounts.map(maskAccount);
  return NextResponse.json({ accounts: safe });
}

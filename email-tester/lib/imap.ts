import { ImapFlow } from "imapflow";
import type { SeedAccount, FetchedEmail, AccountResult, EmailCategory } from "@/types";

const FETCH_LIMIT = 25;   // per folder — bumped from 10
const IMAP_TIMEOUT = 25_000;

function extractSenderIp(headerText: string): string {
  // Collect all Received: header blocks
  const receivedBlocks: string[] = [];
  let cur = "";
  for (const line of headerText.split(/\r?\n/)) {
    if (/^Received:/i.test(line)) { if (cur) receivedBlocks.push(cur); cur = line; }
    else if (cur && /^\s/.test(line)) cur += " " + line.trim();
    else if (cur) { receivedBlocks.push(cur); cur = ""; }
  }
  if (cur) receivedBlocks.push(cur);

  for (const block of receivedBlocks) {
    const matches = block.match(/\[(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]/g) ?? [];
    for (const m of matches) {
      const ip = m.slice(1, -1);
      if (
        !ip.startsWith("10.") &&
        !ip.startsWith("192.168.") &&
        !ip.startsWith("172.16.") &&
        !ip.startsWith("172.17.") &&
        !ip.startsWith("172.18.") &&
        !ip.startsWith("172.19.") &&
        !ip.startsWith("172.2") &&
        !ip.startsWith("172.3") &&
        ip !== "127.0.0.1" &&
        ip !== "0.0.0.0"
      ) return ip;
    }
  }
  const xip = headerText.match(/X-Originating-IP:\s*\[?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]?/i);
  if (xip) return xip[1];
  return "N/A";
}

function detectCategory(headerText: string, base: EmailCategory): EmailCategory {
  const labels = headerText.match(/X-Gmail-Labels:\s*(.+)/i)?.[1] ?? "";
  if (/category_promotions|Promotions/i.test(labels)) return "promotions";
  if (/category_updates|Updates/i.test(labels))       return "updates";
  if (/category_forums|Forums/i.test(labels))         return "forums";
  if (/category_social|Social/i.test(labels))         return "social";
  // Heuristic: List-Unsubscribe = bulk mail
  if (/List-Unsubscribe:/i.test(headerText) && base !== "spam") {
    const isTxn = /notification|alert|receipt|order|invoice|statement|confirm|verify|reset|password|activation/i.test(headerText);
    return isTxn ? "updates" : "promotions";
  }
  return base;
}

async function fetchFolder(
  client: ImapFlow,
  mailbox: string,
  base: EmailCategory,
  limit: number
): Promise<FetchedEmail[]> {
  const emails: FetchedEmail[] = [];
  try {
    let st;
    try { st = await client.status(mailbox, { messages: true }); }
    catch { return emails; } // folder doesn't exist
    if (!st?.messages) return emails;

    await client.mailboxOpen(mailbox, { readOnly: true });
    const total = st.messages;
    const range = `${Math.max(1, total - limit + 1)}:*`;

    for await (const msg of client.fetch(range, {
      uid: true,
      envelope: true,
      headers: ["received", "x-originating-ip", "x-gmail-labels", "list-unsubscribe", "x-mailer"],
      flags: true,
    })) {
      const env = msg.envelope;
      const fr = env?.from?.[0];
      const headerText = msg.headers ? msg.headers.toString() : "";
      emails.push({
        uid: msg.uid,
        subject:  env?.subject ?? "(no subject)",
        from:     fr?.address ?? "",
        fromName: fr?.name || fr?.address || "Unknown",
        senderIp: extractSenderIp(headerText),
        date:     env?.date?.toISOString() ?? new Date().toISOString(),
        category: detectCategory(headerText, base),
        snippet:  "",
      });
    }
    await client.mailboxClose();
  } catch (err) {
    console.warn(`[imap] fetchFolder(${mailbox}):`, (err as Error).message);
  }
  return emails;
}

export async function checkAccount(account: SeedAccount): Promise<AccountResult> {
  const base = {
    accountId: account.id,
    email:     account.email,
    label:     account.label,
    provider:  account.host.includes("gmail") ? "gmail" as const
             : account.host.includes("outlook") ? "outlook" as const
             : "other" as const,
    lastChecked: new Date().toISOString(),
  };

  if (!account.password) {
    return { ...base, status: "offline", emails: [], error: "No app password configured." };
  }

  const client = new ImapFlow({
    host: account.host,
    port: account.port,
    secure: true,
    auth: { user: account.email, pass: account.password },
    logger: false,
    connectionTimeout: IMAP_TIMEOUT,
    greetingTimeout:   IMAP_TIMEOUT,
    socketTimeout:     IMAP_TIMEOUT,
  });

  const work = (async (): Promise<AccountResult> => {
    try {
      await client.connect();
      const isGmail = account.host.includes("gmail");

      // Fetch INBOX and Spam/Junk sequentially (IMAP can't open 2 mailboxes at once)
      let all: FetchedEmail[] = [];

      if (isGmail) {
        const inbox = await fetchFolder(client, "INBOX",         "primary", FETCH_LIMIT);
        const spam  = await fetchFolder(client, "[Gmail]/Spam",  "spam",    FETCH_LIMIT);
        all = [...inbox, ...spam];
      } else {
        const inbox = await fetchFolder(client, "INBOX", "inbox", FETCH_LIMIT);
        // Try Junk first, fall back to Spam
        let junk = await fetchFolder(client, "Junk", "spam", FETCH_LIMIT);
        if (!junk.length) junk = await fetchFolder(client, "Spam", "spam", FETCH_LIMIT);
        all = [...inbox, ...junk];
      }

      // Dedupe and sort newest first
      const seen = new Set<number>();
      const unique = all.filter(e => {
        if (seen.has(e.uid)) return false;
        seen.add(e.uid);
        return true;
      });
      unique.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return { ...base, status: "online", emails: unique };
    } finally {
      try { await client.logout(); } catch { try { client.close(); } catch {} }
    }
  })();

  const timer = new Promise<AccountResult>((_, reject) =>
    setTimeout(() => reject(new Error("IMAP timed out after 25s")), IMAP_TIMEOUT)
  );

  try {
    return await Promise.race([work, timer]);
  } catch (err) {
    return { ...base, status: "offline", emails: [], error: (err as Error).message ?? "IMAP error" };
  }
}

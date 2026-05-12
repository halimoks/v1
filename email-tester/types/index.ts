export interface SeedAccount {
  id: string;
  label: string;
  email: string;
  password: string;
  host: string;
  port: number;
}

export type EmailCategory =
  | "primary"
  | "promotions"
  | "updates"
  | "forums"
  | "social"
  | "spam"
  | "inbox"
  | "unknown";

export interface FetchedEmail {
  uid: number;
  subject: string;
  from: string;
  fromName: string;
  senderIp: string;
  date: string;
  category: EmailCategory;
  snippet: string;
  isNew?: boolean;
}

export interface AccountResult {
  accountId: string;
  email: string;
  label: string;
  provider: "gmail" | "outlook" | "other";
  status: "online" | "offline" | "loading";
  emails: FetchedEmail[];
  error?: string;
  lastChecked?: string;
}

export interface CheckResponse {
  results: AccountResult[];
  checkedAt: string;
}

import Papa from "papaparse";
import { LogsTableClient } from "@/components/LogsTableClient";

export const revalidate = 0;

export default async function CallLogsPage() {
  let logs: any[] = [];
  let error: string | null = null;

  try {
    const csvUrl = "https://docs.google.com/spreadsheets/d/1mrt3Eka0Kl1bNPmkgsLizHKnmqZbvQOP4KMgo5SceUI/export?format=csv";
    const res = await fetch(csvUrl, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.statusText}`);
    }
    const csvText = await res.text();
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    
    // Default chronological
    logs = parsed.data;
  } catch (err: any) {
    console.error(err);
    error = err.message || "Failed to load Google Sheet";
  }

  return <LogsTableClient initialLogs={logs} error={error} />;
}

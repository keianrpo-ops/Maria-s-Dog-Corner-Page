import { google } from "googleapis";
import type { calendar_v3 } from "googleapis";

const VERSION = "api/calendar/_client@v4";
const SCOPES = ["https://www.googleapis.com/auth/calendar"];

let cachedAuth: any | null = null;
let cachedCalendar: calendar_v3.Calendar | null = null;

type SAJson = {
  client_email: string;
  private_key: string;
  project_id?: string;
};

function readServiceAccount(): SAJson {
  // 1. Intentar leer desde un JSON completo
  const rawJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson) as SAJson;
      if (!parsed?.client_email || !parsed?.private_key) {
        throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON missing fields");
      }
      return {
        client_email: parsed.client_email.trim(),
        private_key: parsed.private_key.replace(/\\n/g, "\n"),
      };
    } catch (e: any) {
      throw new Error(`Invalid JSON format: ${e?.message}`);
    }
  }

  // 2. Leer desde variables separadas (Lo que tú estás usando)
  const email = (
    process.env.GOOGLE_CLIENT_EMAIL ||
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
    ""
  ).trim().replace(/^"(.*)"$/, '$1'); // Limpia comillas accidentales de PowerShell

  const keyRaw = (
    process.env.GOOGLE_PRIVATE_KEY ||
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ||
    ""
  ).trim().replace(/^"(.*)"$/, '$1'); // Limpia comillas accidentales de PowerShell

  if (!email) {
    throw new Error("Missing GOOGLE_CLIENT_EMAIL or GOOGLE_SERVICE_ACCOUNT_EMAIL");
  }
  if (!keyRaw) {
    throw new Error("Missing GOOGLE_PRIVATE_KEY");
  }

  return {
    client_email: email,
    // El fix para el error DECODER routines::unsupported
    private_key: keyRaw.replace(/\\n/g, "\n"),
  };
}

export function getCalendarId(): string {
  const id = (
    process.env.GOOGLE_CALENDAR_ID ||
    process.env.MDC_GOOGLE_CALENDAR_ID ||
    ""
  ).trim().replace(/^"(.*)"$/, '$1');
  
  if (!id) throw new Error("Missing GOOGLE_CALENDAR_ID");
  return id;
}

export function getCalendarTimeZone(): string {
  return process.env.MDC_CALENDAR_TZ || "Europe/London";
}

export async function getAuthorizedAuthClient() {
  if (cachedAuth) return cachedAuth;

  const sa = readServiceAccount();

  const auth = new google.auth.JWT({
    email: sa.client_email,
    key: sa.private_key,
    scopes: SCOPES,
  });

  // Forzar autorización para validar la llave antes de usarla
  await auth.authorize();

  cachedAuth = auth;
  return auth;
}

export async function getAuthorizedCalendarClient(): Promise<calendar_v3.Calendar> {
  if (cachedCalendar) return cachedCalendar;
  const auth = await getAuthorizedAuthClient();
  cachedCalendar = google.calendar({ version: "v3", auth });
  return cachedCalendar;
}

export { VERSION };
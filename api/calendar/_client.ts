import { google } from "googleapis";

function getServiceAccountCredentials() {
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64;
  if (!b64) throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_KEY_BASE64");

  const json = Buffer.from(b64, "base64").toString("utf-8");
  const creds = JSON.parse(json);

  if (!creds.client_email || !creds.private_key) {
    throw new Error("Invalid service account JSON: missing client_email/private_key");
  }

  return {
    client_email: creds.client_email as string,
    private_key: (creds.private_key as string).replace(/\\n/g, "\n"),
  };
}

export function getCalendarClient() {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!calendarId) throw new Error("Missing GOOGLE_CALENDAR_ID");

  const credentials = getServiceAccountCredentials();

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  const calendar = google.calendar({ version: "v3", auth });

  return { calendar, calendarId };
}

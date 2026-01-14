import { google } from "googleapis";
import fs from "fs";
import path from "path";

type ServiceAccountKey = {
  client_email: string;
  private_key: string;
  [k: string]: any;
};

function normalizePrivateKey(keyObj: any) {
  if (keyObj?.private_key) keyObj.private_key = String(keyObj.private_key).replace(/\\n/g, "\n");
  return keyObj;
}

function validateKey(keyObj: any) {
  if (!keyObj || typeof keyObj !== "object") throw new Error("Invalid service account JSON (not an object).");
  if (!keyObj.client_email) throw new Error("Invalid service account JSON: missing client_email.");
  if (!keyObj.private_key) throw new Error("Invalid service account JSON: missing private_key.");
  return keyObj as ServiceAccountKey;
}

/**
 * ✅ Importante:
 * - En Vercel: usa GOOGLE_SERVICE_ACCOUNT_KEY_BASE64
 * - En local: puedes usar GOOGLE_SERVICE_ACCOUNT_KEY_PATH
 * Si BASE64 existe pero está malo, NO reventamos: intentamos PATH.
 */
function readServiceAccountKey() {
  const errors: string[] = [];

  // 1) BASE64 (Vercel recomendado)
  const base64Key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64;
  if (base64Key && base64Key.trim()) {
    try {
      const cleaned = base64Key.trim().replace(/\s/g, "");
      const decodedText = Buffer.from(cleaned, "base64").toString("utf-8");
      const keyObj = validateKey(normalizePrivateKey(JSON.parse(decodedText)));
      return keyObj;
    } catch (e: any) {
      errors.push("BASE64: " + (e?.message || String(e)));
      // seguimos a la siguiente opción
    }
  }

  // 2) JSON directo en env (opcional)
  const jsonKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON;
  if (jsonKey && jsonKey.trim()) {
    try {
      const keyObj = validateKey(normalizePrivateKey(JSON.parse(jsonKey)));
      return keyObj;
    } catch (e: any) {
      errors.push("JSON: " + (e?.message || String(e)));
    }
  }

  // 3) PATH local
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
  if (keyPath && keyPath.trim()) {
    try {
      const absPath = path.isAbsolute(keyPath) ? keyPath : path.join(process.cwd(), keyPath);
      if (!fs.existsSync(absPath)) throw new Error(`File not found: ${absPath}`);
      const raw = fs.readFileSync(absPath, "utf-8");
      const keyObj = validateKey(normalizePrivateKey(JSON.parse(raw)));
      return keyObj;
    } catch (e: any) {
      errors.push("PATH: " + (e?.message || String(e)));
    }
  }

  throw new Error(
    "Missing/invalid Google credentials. Provide GOOGLE_SERVICE_ACCOUNT_KEY_BASE64 (recommended) or GOOGLE_SERVICE_ACCOUNT_KEY_PATH. " +
      (errors.length ? `Details: ${errors.join(" | ")}` : "")
  );
}

export function getCalendarId() {
  const id = process.env.GOOGLE_CALENDAR_ID || "";
  if (!id) throw new Error("Missing GOOGLE_CALENDAR_ID.");
  return id;
}

let _cachedCalendar: ReturnType<typeof google.calendar> | null = null;
let _cachedAuth: any | null = null;
let _authorizedOnce = false;

export function getAuthClient() {
  if (_cachedAuth) return _cachedAuth;

  const key = readServiceAccountKey();

  // ✅ forma robusta (menos errores que la firma posicional)
  const auth = new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  _cachedAuth = auth;
  return _cachedAuth;
}

/**
 * ✅ CLAVE:
 * Forzamos authorize() al menos una vez para garantizar que exista access_token.
 * Esto evita el error “missing required authentication credential”.
 */
export async function getAuthorizedAuthClient() {
  const auth = getAuthClient();

  if (!_authorizedOnce) {
    await auth.authorize();
    _authorizedOnce = true;
  }

  return auth;
}

export function getCalendarClient() {
  if (_cachedCalendar) return _cachedCalendar;

  const auth = getAuthClient();
  _cachedCalendar = google.calendar({ version: "v3", auth });

  return _cachedCalendar;
}

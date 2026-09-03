/**
 * Single point of contact with the Irmis (earmiss) API.
 *
 * Nothing outside of `app/api/summaries/**` should import this module: the
 * browser must always go through our own `/api/summaries/*` routes so that the
 * upstream host, timeouts and error shapes stay server-side concerns.
 */

const DEFAULT_BASE_URL = 'https://api.earmiss.ru';
const DEFAULT_TIMEOUT_MS = 10_000;

export const SUMMARY_UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type IrmisResult =
    | { ok: true; response: Response }
    | { ok: false; reason: 'timeout' | 'network'; error: unknown };

let warnedAboutBaseUrl = false;

/**
 * Base URL of the upstream API. Overridable with `IRMIS_API_BASE_URL`; an
 * invalid or non-http(s) value is ignored rather than trusted, so a typo in the
 * environment cannot turn the proxy into an open redirect / SSRF hop.
 */
function resolveBaseUrl(): string {
    const raw = process.env.IRMIS_API_BASE_URL?.trim();
    if (!raw) return DEFAULT_BASE_URL;

    try {
        const parsed = new URL(raw);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            throw new Error(`unsupported protocol: ${parsed.protocol}`);
        }
        return raw.replace(/\/+$/, '');
    } catch {
        if (!warnedAboutBaseUrl) {
            warnedAboutBaseUrl = true;
            console.warn(
                `[irmis] Ignoring invalid IRMIS_API_BASE_URL, falling back to ${DEFAULT_BASE_URL}`
            );
        }
        return DEFAULT_BASE_URL;
    }
}

function resolveTimeoutMs(): number {
    const parsed = Number(process.env.IRMIS_API_TIMEOUT_MS);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
}

/**
 * Perform a request against the Irmis API. Never throws: network failures and
 * timeouts come back as `{ ok: false }` so callers can map them to a status
 * code without guessing at error shapes.
 */
export async function irmisFetch(path: string, init: RequestInit = {}): Promise<IrmisResult> {
    const url = `${resolveBaseUrl()}/${path.replace(/^\/+/, '')}`;
    const controller = new AbortController();
    let timedOut = false;

    const timer = setTimeout(() => {
        timedOut = true;
        controller.abort();
    }, resolveTimeoutMs());

    try {
        const response = await fetch(url, {
            ...init,
            cache: 'no-store',
            redirect: 'follow',
            signal: controller.signal,
            headers: { Accept: 'application/json', ...init.headers },
        });
        return { ok: true, response };
    } catch (error) {
        return { ok: false, reason: timedOut ? 'timeout' : 'network', error };
    } finally {
        clearTimeout(timer);
    }
}

/** `GET /summaries/{uuid}`. Caller is responsible for validating the uuid. */
export function fetchIrmisSummary(uuid: string): Promise<IrmisResult> {
    return irmisFetch(`summaries/${encodeURIComponent(uuid)}`);
}

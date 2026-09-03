const ATTACHED_RE = /^\[attached:\s*(.+?)\]$/i;

const SUMMARY_PATH_RE =
    /\/summary\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;

/** Filenames a broken form submission can leave behind. Never a real attachment. */
const JUNK_FILENAMES = new Set(['undefined', 'null', '']);

export function isHttpUrl(value?: string | null): boolean {
    if (!value) return false;
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

/**
 * `fileUrl` does triple duty across Material/Submission/Tool: an external http
 * URL, an Irmis `/summary/{uuid}` link, or an `[attached: name.pdf]` sentinel
 * left over from a submission whose file was never stored anywhere.
 *
 * The sentinel is a display label, not a location. Treat it as such everywhere.
 */
export function isAttachedPlaceholder(fileUrl?: string | null): boolean {
    return typeof fileUrl === 'string' && ATTACHED_RE.test(fileUrl.trim());
}

export function parseAttachedFilename(fileUrl?: string | null): string | null {
    if (!fileUrl) return null;
    const match = fileUrl.trim().match(ATTACHED_RE);
    const name = match?.[1]?.trim();
    if (!name || JUNK_FILENAMES.has(name.toLowerCase())) return null;
    return name;
}

export function summaryUuidFromFileUrl(fileUrl?: string | null): string | null {
    if (!fileUrl || isAttachedPlaceholder(fileUrl)) return null;
    return fileUrl.match(SUMMARY_PATH_RE)?.[1] || null;
}

/** A same-origin app path such as `/tools/spell-check`, never protocol-relative. */
export function isInternalPath(value?: string | null): boolean {
    return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//');
}

export type ResolvedLink =
    | { kind: 'summary'; href: string; uuid: string }
    | { kind: 'internal'; href: string }
    | { kind: 'external'; href: string }
    | { kind: 'attachment'; filename: string }
    | { kind: 'none' };

/**
 * Decide what a stored `fileUrl` / `Tool.url` actually points at. Call sites
 * should switch on `kind` rather than testing the raw string, so the
 * `[attached: ...]` placeholder can never be handed to `window.open` or an
 * `href` again.
 */
export function resolveStoredLink(value?: string | null): ResolvedLink {
    if (!value) return { kind: 'none' };

    const trimmed = value.trim();
    if (!trimmed) return { kind: 'none' };

    if (isAttachedPlaceholder(trimmed)) {
        const filename = parseAttachedFilename(trimmed);
        return filename ? { kind: 'attachment', filename } : { kind: 'none' };
    }

    const uuid = summaryUuidFromFileUrl(trimmed);
    if (uuid) return { kind: 'summary', href: `/summary/${uuid}`, uuid };

    if (isInternalPath(trimmed)) return { kind: 'internal', href: trimmed };

    if (isHttpUrl(trimmed)) return { kind: 'external', href: trimmed };

    return { kind: 'none' };
}

/**
 * The href for values that are safe to navigate to, or `null` for placeholders
 * and anything unparseable.
 */
export function openableHref(value?: string | null): string | null {
    const link = resolveStoredLink(value);
    return link.kind === 'attachment' || link.kind === 'none' ? null : link.href;
}

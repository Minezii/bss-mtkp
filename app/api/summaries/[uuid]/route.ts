import { NextResponse } from 'next/server';
import { SUMMARY_UUID_RE, fetchIrmisSummary } from '@/lib/irmis';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' };

/**
 * Map an upstream status onto one we are willing to expose. 4xx are meaningful
 * to the client and pass through; anything else (3xx leftovers, 5xx) collapses
 * into 502 because it is our proxy hop that failed, not the request.
 */
function mapUpstreamStatus(status: number): number {
    if (status >= 400 && status < 500) return status;
    return 502;
}

export async function GET(
    _request: Request,
    context: { params: Promise<{ uuid: string }> | { uuid: string } }
) {
    const { uuid } = await Promise.resolve(context.params);

    if (!uuid || !SUMMARY_UUID_RE.test(uuid)) {
        return NextResponse.json(
            { error: 'Invalid summary id' },
            { status: 400, headers: NO_STORE }
        );
    }

    const result = await fetchIrmisSummary(uuid);

    if (!result.ok) {
        console.error(`Irmis proxy ${result.reason} for summary ${uuid}:`, result.error);
        return NextResponse.json(
            {
                error:
                    result.reason === 'timeout'
                        ? 'Irmis API timed out'
                        : 'Failed to reach Irmis API',
            },
            { status: result.reason === 'timeout' ? 504 : 502, headers: NO_STORE }
        );
    }

    const { response } = result;

    if (!response.ok) {
        return NextResponse.json(
            {
                error: response.status === 404 ? 'Summary not found' : 'Irmis API error',
                upstreamStatus: response.status,
            },
            { status: mapUpstreamStatus(response.status), headers: NO_STORE }
        );
    }

    // Forward the payload verbatim, but only the content type - upstream
    // cookies and cache directives stay out of the browser.
    const body = await response.text();
    const contentType = response.headers.get('content-type') || 'application/json';

    return new NextResponse(body, {
        status: 200,
        headers: { 'Content-Type': contentType, ...NO_STORE },
    });
}
